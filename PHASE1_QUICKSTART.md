# Phase 1 Quick-Start Implementation Guide

## Quick Overview
This guide walks you through implementing the core backend API for the project management application. Focus on this before building the frontend.

---

## 🔧 Step 1: Install Database & Dependencies

### Option A: MongoDB (Recommended for beginners)

```bash
# Install MongoDB driver and utilities
npm install mongoose bcryptjs jsonwebtoken express-validator cors

# Install dev dependency for testing
npm install --save-dev jest
```

### Option B: PostgreSQL

```bash
npm install pg sequelize bcryptjs jsonwebtoken express-validator cors
```

**I recommend MongoDB** for this project as it requires less setup and schema flexibility.

---

## 📝 Step 2: Setup Environment Variables

Create `.env` file in root:

```
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/project-management
# OR MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-management?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create `.env.example`:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🗂️ Step 3: Create Database Connection

Create `src/db/connection.js`:

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

Update `src/index.js`:

```javascript
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connection.js";

dotenv.config({ path: "./.env", override: true });

const port = process.env.PORT || 3000;

// Connect to database
connectDB();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
```

---

## 👤 Step 4: Create User Model

Create `src/models/User.js`:

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
```

---

## 📋 Step 5: Create Project & Task Models

Create `src/models/Project.js`:

```javascript
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'member'],
          default: 'member',
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
```

Create `src/models/Task.js`:

```javascript
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed', 'cancelled'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    dueDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
```

---

## 🔐 Step 6: Create Authentication Controller

Create `src/controllers/authController.js`:

```javascript
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc Register user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current logged in user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🛡️ Step 7: Create Authentication Middleware

Create `src/middlewares/auth.js`:

```javascript
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};
```

---

## 🚏 Step 8: Create Routes

Create `src/routes/auth.js`:

```javascript
import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);

export default router;
```

Create `src/routes/projects.js`:

```javascript
import express from 'express';
import { protect } from '../middlewares/auth.js';
import Project from '../models/Project.js';

const router = express.Router();

// Get all projects for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { 'members.user': req.userId }],
    }).populate('owner', 'name email');

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      owner: req.userId,
      members: [{ user: req.userId, role: 'owner' }],
    });

    const populatedProject = await project.populate('owner', 'name email');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', protect, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
```

---

## Step 9: Update Main App File

Update `src/app.js`:

```javascript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Project Management API');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

export default app;
```

---

## 🧪 Step 10: Test Your API

### Using Postman or VS Code REST Client

**1. Register User**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Login**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**3. Get Current User** (use token from login)
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**4. Create Project** (use token)
```
POST http://localhost:3000/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "My First Project",
  "description": "Project description",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**5. Get All Projects**
```
GET http://localhost:3000/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ What You've Built

After completing these steps:
- ✅ Database connection (MongoDB)
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Project CRUD operations
- ✅ Protected routes
- ✅ Basic API structure

## 🎯 Next Steps

1. Add Task CRUD routes (similar to projects)
2. Add input validation (express-validator)
3. Add error handling middleware
4. Add more fields/features as needed
5. Then proceed with Phase 3 (Frontend)

---

## 📚 Quick Commands

```bash
# Install all dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

---

## 🆘 Troubleshooting

**MongoDB Connection Error**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- For Atlas: ensure IP whitelist includes your current IP

**JWT Errors**
- Make sure JWT_SECRET is set in .env
- Token might be expired (check JWT_EXPIRE setting)

**CORS Issues**
- Add your frontend URL to ALLOWED_ORIGINS in .env
- Example: `ALLOWED_ORIGINS=http://localhost:5173`
