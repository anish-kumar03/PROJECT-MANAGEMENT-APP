# Phase 1 Implementation Checklist

Complete this checklist as you implement Phase 1. Check off items as you finish them.

---

## 📦 Setup & Dependencies

- [ ] Initialize git repository (`git init`)
- [ ] Create `.env` file with all required variables
- [ ] Create `.env.example` file for documentation
- [ ] Add `.env` to `.gitignore`
- [ ] Install MongoDB locally OR create MongoDB Atlas account
- [ ] Run `npm install mongoose bcryptjs jsonwebtoken express-validator cors`
- [ ] Update `package.json` with proper scripts
- [ ] Test: `npm run dev` should start server without errors

---

## 🗄️ Database Setup

- [ ] Create `src/db/connection.js`
- [ ] Test MongoDB connection
- [ ] Connection logs show "MongoDB Connected"
- [ ] Update `src/index.js` to initialize DB connection
- [ ] Verify database connection on server startup

---

## 👤 User Model & Auth

- [ ] Create `src/models/User.js`
- [ ] Add fields: name, email, password, role, timestamps
- [ ] Implement password hashing (bcrypt pre-save hook)
- [ ] Add password comparison method
- [ ] Create `src/controllers/authController.js`
- [ ] Implement `register` endpoint
- [ ] Implement `login` endpoint
- [ ] Implement `getCurrentUser` endpoint
- [ ] Test: Register a user via Postman
- [ ] Test: Login returns JWT token
- [ ] Test: Token verification works
- [ ] Verify password is hashed in database (not plain text)

---

## 🔐 Authentication Middleware

- [ ] Create `src/middlewares/auth.js`
- [ ] Implement JWT verification middleware
- [ ] Extract user ID from token
- [ ] Handle missing/invalid tokens
- [ ] Test: Protected routes reject requests without token
- [ ] Test: Protected routes accept valid tokens

---

## 📋 Project Model & CRUD

- [ ] Create `src/models/Project.js`
- [ ] Add fields: name, description, owner, members, status, dates, timestamps
- [ ] Implement Project references to User model
- [ ] Create `src/controllers/projectController.js` (or add to routes)
- [ ] Implement `GET /api/projects` (list user's projects)
- [ ] Implement `POST /api/projects` (create project)
- [ ] Implement `GET /api/projects/:id` (get project details)
- [ ] Implement `PUT /api/projects/:id` (update project)
- [ ] Implement `DELETE /api/projects/:id` (delete project)
- [ ] Test: Create project endpoint
- [ ] Test: User can only see their own projects
- [ ] Test: Only owner can update/delete project
- [ ] Test: Update project modifies database
- [ ] Test: Delete project removes from database

---

## 📌 Task Model & CRUD

- [ ] Create `src/models/Task.js`
- [ ] Add fields: title, description, project, assignedTo, status, priority, dueDate, timestamps
- [ ] Implement Task references to Project and User models
- [ ] Create `src/controllers/taskController.js` (or add to routes)
- [ ] Implement `POST /api/projects/:projectId/tasks` (create task)
- [ ] Implement `GET /api/projects/:projectId/tasks` (list tasks)
- [ ] Implement `GET /api/tasks/:id` (get task details)
- [ ] Implement `PUT /api/tasks/:id` (update task)
- [ ] Implement `DELETE /api/tasks/:id` (delete task)
- [ ] Implement `PUT /api/tasks/:id/status` (update only status)
- [ ] Test: Create task in existing project
- [ ] Test: Tasks are linked to projects correctly
- [ ] Test: Can update task status
- [ ] Test: Can filter tasks by project
- [ ] Test: Unauthorized users cannot access tasks

---

## 🛣️ Routes Organization

- [ ] Create `src/routes/auth.js`
- [ ] Create `src/routes/projects.js`
- [ ] Create `src/routes/tasks.js` (or nest under projects)
- [ ] Import all routes in `src/app.js`
- [ ] Verify all routes are prefixed with `/api/`
- [ ] Test: All endpoints respond to correct paths

---

## 🧹 Error Handling & Middleware

- [ ] Add global error handling middleware in `src/app.js`
- [ ] Add 404 handler for undefined routes
- [ ] Validate all inputs in controllers
- [ ] Return proper HTTP status codes (201 for create, 404 for not found, etc.)
- [ ] Add error messages in all error responses
- [ ] Handle duplicate email errors in registration
- [ ] Handle password validation errors
- [ ] Test: Invalid requests return proper error messages
- [ ] Test: 404 routes return 404 status

---

## 🔗 App.js Configuration

- [ ] Add CORS middleware with allowed origins
- [ ] Add express.json() middleware
- [ ] Setup all route imports
- [ ] Add error handling middleware
- [ ] Add 404 handler
- [ ] Test: CORS works (frontend can call backend)
- [ ] Test: JSON parsing works for POST/PUT requests

---

## 🧪 Postman Testing

### Auth Endpoints
- [ ] POST `/api/auth/register` - Create new user
- [ ] POST `/api/auth/login` - Get JWT token
- [ ] GET `/api/auth/me` - Get current user (protected)

### Project Endpoints
- [ ] POST `/api/projects` - Create project
- [ ] GET `/api/projects` - List all projects
- [ ] GET `/api/projects/:id` - Get single project
- [ ] PUT `/api/projects/:id` - Update project
- [ ] DELETE `/api/projects/:id` - Delete project

### Task Endpoints
- [ ] POST `/api/projects/:projectId/tasks` - Create task
- [ ] GET `/api/projects/:projectId/tasks` - List tasks
- [ ] GET `/api/tasks/:id` - Get single task
- [ ] PUT `/api/tasks/:id` - Update task
- [ ] DELETE `/api/tasks/:id` - Delete task
- [ ] PUT `/api/tasks/:id/status` - Update task status

---

## 🔍 Data Integrity Tests

- [ ] Passwords are hashed (not readable in MongoDB)
- [ ] Users can't register with same email twice
- [ ] Users can't login with wrong password
- [ ] Projects have owner assigned
- [ ] Only project owner can edit/delete
- [ ] Tasks are linked to correct project
- [ ] Tasks are linked to correct user (if assigned)
- [ ] Timestamps (createdAt, updatedAt) are set automatically
- [ ] Deleted projects don't exist in database
- [ ] Deleted tasks don't exist in database

---

## 🔒 Security Tests

- [ ] Passwords are stored as hashes (bcrypt)
- [ ] JWT tokens expire after configured time
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Requests without token to protected routes are rejected
- [ ] Users can't access other users' personal data
- [ ] Users can't edit/delete others' projects
- [ ] SQL injection not possible (using Mongoose)

---

## 📊 MongoDB Verification

- [ ] Collections created: users, projects, tasks
- [ ] Indexes are created (especially for email unique constraint)
- [ ] Data is persisted after restart
- [ ] Can view data in MongoDB Compass
- [ ] Can manually query and update data

---

## 📝 Documentation

- [ ] Document all API endpoints
- [ ] Document request/response formats
- [ ] Document authentication method
- [ ] Document error codes
- [ ] Create API documentation file or Postman collection
- [ ] Add comments to complex code
- [ ] Update README.md with setup instructions

---

## ✅ Final Phase 1 Verification

Before moving to Phase 2, verify:

- [ ] Server starts without errors: `npm run dev`
- [ ] All endpoints work in Postman
- [ ] Authentication flow works (register → login → access protected route)
- [ ] Data persists in MongoDB
- [ ] Error handling provides clear messages
- [ ] Unauthorized access is properly rejected
- [ ] No sensitive data (passwords) exposed in responses
- [ ] CORS is working if frontend will be on different domain
- [ ] Environment variables are used (no hardcoded values)
- [ ] Project structure is clean and organized

---

## 🎯 Phase 1 Complete!

When all checkboxes are ✅, you're ready for:

```
✅ Phase 1 Complete
  ↓
📚 Review Phase 2 requirements (FEATURE_ROADMAP.md)
  ↓
🔨 Start Phase 2 OR jump to Phase 3 (Frontend)
```

---

## 📞 Troubleshooting Help

### Server won't start
- [ ] Check `.env` file exists with MONGODB_URI
- [ ] Check MongoDB is running
- [ ] Check PORT is available
- [ ] Run: `npm run dev` and read error message carefully

### MongoDB connection fails
- [ ] MongoDB not running: Run `mongod` in terminal
- [ ] Wrong connection string: Check MONGODB_URI in `.env`
- [ ] IP whitelist (Atlas): Add your IP in MongoDB Atlas settings

### JWT errors
- [ ] JWT_SECRET not set in `.env`
- [ ] Token not in Authorization header: Use `Bearer YOUR_TOKEN`
- [ ] Token expired: Re-login to get new token

### CORS errors
- [ ] Frontend URL not in ALLOWED_ORIGINS
- [ ] Add `http://localhost:5173` (for Vite) to .env

### Tests failing in Postman
- [ ] Paste token in Authorization header (not request body)
- [ ] Use correct HTTP method (POST for create, PUT for update)
- [ ] Check request body is JSON with proper content-type
- [ ] Verify user exists before trying to login

---

**Keep this checklist in your project and check off items as you complete them!** ✅
