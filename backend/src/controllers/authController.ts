import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import Session from '../models/Session';
import { generateTokens } from '../utils/generateTokens';
import sendEmail from '../utils/sendEmail';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to set cookies
const setTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;
    const message = `You are receiving this email because you need to verify your email address. Please make a PUT request to: \n\n ${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message,
      });
    } catch (error) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email sending failed', error);
      // We still return 201 because the user is created, but they might need to request a new token
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Create Session
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    await Session.create({
      user: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    setTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({ message: 'Account locked. Try again later.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Successful login: reset attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Create Session
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    await Session.create({
      user: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    setTokenCookie(res, refreshToken);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  
  if (token) {
    // Invalidate the session
    await Session.findOneAndUpdate({ refreshToken: token }, { isValid: false });
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
};

export const logoutAllDevices = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    
    // Invalidate all sessions for the user
    await Session.updateMany({ user: decoded.id }, { isValid: false });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded: any = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Find the session
    const session = await Session.findOne({ refreshToken: oldToken });

    // Refresh Token Rotation - Detect Token Reuse
    if (!session || !session.isValid) {
      // Security breach! Someone used a consumed or invalid refresh token.
      // Invalidate ALL sessions for this user.
      await Session.updateMany({ user: user._id }, { isValid: false });
      return res.status(403).json({ message: 'Token reuse detected. All sessions invalidated. Please log in again.' });
    }

    // Invalidate the old token
    session.isValid = false;
    await session.save();

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

    // Create a new session for the new refresh token
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    await Session.create({
      user: user._id,
      refreshToken: newRefreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    setTokenCookie(res, newRefreshToken);

    res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Normally this would be a frontend URL that contains the token.
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Unlock account if locked
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();

    // Optionally generate token and login the user, or just ask them to login again
    res.status(200).json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};

export const googleOAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No Google token provided' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if one doesn't exist
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'), // Dummy password, will not be used
        googleId,
        isEmailVerified: true, // Google verifies emails
        avatar: picture,
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isEmailVerified = true;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Create Session
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    await Session.create({
      user: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    setTokenCookie(res, refreshToken);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
