import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  logoutAllDevices, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  googleOAuth 
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/logout-all', logoutAllDevices);
router.post('/refresh', refreshToken);
router.put('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.post('/google', googleOAuth);

export default router;
