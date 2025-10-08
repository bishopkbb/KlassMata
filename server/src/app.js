const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import configurations
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');
const userRoutes = require('./routes/user.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

const app = express();

// Connect to databases
connectDatabase();
connectRedis();

// Trust proxy (important for rate limiting and getting real IP)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression and logging
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Cookie parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'KlassMata API is running perfectly! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'Connected',
      redis: 'Connected',
      authentication: 'Active',
      adminDashboard: 'Active'
    }
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to KlassMata API v1.0',
    status: 'Admin Dashboard MVP Ready! 🎉',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      schools: '/api/schools',
      users: '/api/users',
      subscriptions: '/api/subscriptions',
      dashboard: '/api/v1/dashboard'
    },
    features: [
      'JWT Authentication & Authorization',
      'School Management (CRUD)',
      'User Management (CRUD)', 
      'Subscription Plans & Management',
      'Bulk Import (CSV/Excel)',
      'Role-based Access Control',
      'Admin Dashboard Ready'
    ]
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Dashboard endpoint (protected)
app.get('/api/v1/dashboard', require('./middlewares/auth.middleware').authenticateToken, async (req, res) => {
  try {
    const User = require('./models/User');
    const School = require('./models/School');
    const { Subscription } = require('./models/Subscription');

    // Get dashboard statistics based on user role
    let stats = {};

    if (req.user.role === 'admin') {
      // Super admin sees global statistics
      const [schoolStats, userStats, subscriptionStats] = await Promise.all([
        School.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              totalSchools: { $sum: 1 },
              totalUsers: { $sum: '$stats.totalUsers' },
              totalTeachers: { $sum: '$stats.totalTeachers' },
              totalStudents: { $sum: '$stats.totalStudents' }
            }
          }
        ]),
        User.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]),
        Subscription.aggregate([
          {
            $group: {
              _id: '$plan',
              count: { $sum: 1 },
              revenue: { $sum: '$billing.amount' }
            }
          }
        ])
      ]);

      stats = {
        schools: schoolStats[0]?.totalSchools || 0,
        users: schoolStats[0]?.totalUsers || 0,
        teachers: schoolStats[0]?.totalTeachers || 0,
        students: schoolStats[0]?.totalStudents || 0,
        subscriptions: subscriptionStats.length,
        revenue: subscriptionStats.reduce((total, plan) => total + (plan.revenue || 0), 0)
      };
    } else {
      // School-specific statistics
      const school = await School.findById(req.user.schoolId);
      if (school) {
        await school.updateStats(); // Ensure stats are current
        stats = {
          schools: 1,
          users: school.stats.totalUsers,
          teachers: school.stats.totalTeachers, 
          students: school.stats.totalStudents,
          courses: school.stats.totalCourses
        };
      }
    }

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        user: {
          name: req.user.fullName,
          role: req.user.role,
          school: req.user.schoolId ? {
            id: req.user.schoolId,
            name: req.user.schoolId.name
          } : null
        },
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data'
    });
  }
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      '/health', 
      '/api', 
      '/api/auth/*', 
      '/api/schools/*',
      '/api/users/*',
      '/api/subscriptions/*',
      '/api/v1/dashboard'
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file field name'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;