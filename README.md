# RailTrack - Premium Railway Tracking System

RailTrack is a production-ready, full-stack Railway Tracking System built with the **MERN** stack (**MongoDB, Express, React, Node.js**) and **TypeScript**. It features real-time tracking, advanced search, enterprise-grade authentication, and a modern, high-performance UI.

## ✨ Key Features

- **🚀 Real-Time Tracking**: Live train location and status updates powered by **Socket.io**.
- **🔍 Advanced Search**: Search trains by name, number, or route with source and destination stations.
- **🛡️ Enterprise Authentication**: Secure JWT-based auth with silent **Refresh Token rotation** and HttpOnly cookies.
- **📊 Admin Dashboard**: Comprehensive operational console for managing trains, stations, and viewing system analytics.
- **🎨 Premium UI/UX**: Stunning interface with **Dark/Light mode**, **Framer Motion** animations, and **Tailwind CSS 4**.
- **📑 API Documentation**: Interactive API explorer using **Swagger/OpenAPI**.
- **🐳 Docker Ready**: Simplified deployment using Docker and Docker Compose.
- **📱 Mobile Responsive**: Fully optimized for all screen sizes.

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Security**: JWT, Bcrypt, Helmet, CORS, Rate Limiting
- **Documentation**: Swagger-jsdoc, Swagger-ui-express
- **Validation**: Zod

### Frontend
- **Core**: React 19, Vite, TypeScript
- **State Management**: Redux Toolkit (RTK)
- **Styling**: Tailwind CSS 4, Lucide Icons
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod Resolver
- **Networking**: Axios with Interceptors

## 📦 Project Structure

```text
railway-tracking/
├── backend/                # Express server with TypeScript
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth & security
│   │   ├── utils/          # Helpers & seeding
│   │   └── index.ts        # Entry point
│   └── Dockerfile
├── frontend/my-project/    # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page layouts
│   │   ├── redux/          # RTK store & slices
│   │   ├── services/       # API & Socket clients
│   │   └── routes/         # Routing logic
│   └── tailwind.config.js
└── docker-compose.yml      # Orchestration
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- Docker (Optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd railway-tracking
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run seed      # Populate initial stations and trains
   npm run dev       # Start development server
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend/my-project
   npm install
   # Create a .env file with VITE_API_URL=http://localhost:5000/api
   npm run dev       # Start Vite dev server
   ```

## 🔌 API Documentation

Once the backend is running, visit:
`http://localhost:5000/api-docs`

## 🐳 Running with Docker

```bash
docker-compose up --build
```

## 📜 License
This project is licensed under the MIT License.

---
Built with ❤️ by **Antigravity**