<div align="center">

# TASKIFY


**Transform Tasks Into Triumphs Every Day**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Last Commit](https://img.shields.io/github/last-commit/FoldedOdin/Taskify)](https://github.com/FoldedOdin/Taskify)
[![JavaScript](https://img.shields.io/badge/JavaScript-99.7%25-yellow.svg)](https://github.com/FoldedOdin/Taskify)
[![Languages](https://img.shields.io/badge/Languages-3-blue.svg)](https://github.com/FoldedOdin/Taskify)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/FoldedOdin/Taskify)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue.svg)](https://github.com/FoldedOdin/Taskify)


</div>

<div align="center">

## 🎬 **Taskify Demo Video**

[![Taskify Demo Video](https://img.youtube.com/vi/YOUR_YOUTUBE_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_YOUTUBE_VIDEO_ID)

*🎥 Click above to watch the full demo on YouTube*

---

### 🚀 **Ready to Try It Yourself?**

[![Launch Live App](https://img.shields.io/badge/🚀%20Launch%20Live%20App-taskify--todo--list.netlify.app-success?style=for-the-badge&logo=rocket)](https://taskify-todo-list.netlify.app)

</div>
## 🌟 About

A **modern, full-stack todo application** with comprehensive task management features, built with React, Express.js, and MongoDB. Designed for productivity enthusiasts who demand more from their task management tools. 
- **Check it Out:** https://taskify-todo-list.netlify.app

## ✨ Features

### 🎯 Core Task Management
- **➕ Add Tasks** - Create new tasks with rich details and metadata
- **✅ Task Completion** - Mark tasks as complete/incomplete with visual feedback
- **🗑️ Delete Tasks** - Remove tasks with confirmation and rollback capability
- **✏️ Inline Editing** - Double-click any task to edit text directly
- **📊 Task Counter** - Real-time count of active and completed tasks

### ⏰ Advanced Scheduling
- **📅 Due Date & Time** - Set precise due dates and times with calendar picker
- **🕒 Smart Time Selection** - 12-hour format with AM/PM selector
- **⚠️ Past Date Prevention** - Prevents setting due dates in the past
- **🚨 Overdue Indicators** - Visual alerts for overdue tasks
- **⏳ Due Soon Alerts** - Highlights tasks due within 24 hours

### 🏷️ Organization & Categorization
- **📂 Categories** - Organize tasks by Work, Personal, Shopping, Health
- **🎚️ Priority Levels** - Set High, Medium, or Low priority
- **🏷️ Tags System** - Add custom tags and use predefined quick tags
- **🔍 Category Filtering** - Filter tasks by category
- **🔎 Search Functionality** - Search tasks by text content

### 🚀 User Experience
- **🖱️ Drag & Drop Reordering** - Reorder tasks with intuitive drag and drop
- **🌙 Dark Mode Support** - Automatic dark/light theme switching
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **⏳ Loading States** - Visual feedback during all operations
- **🛠️ Error Handling** - Graceful error recovery with user-friendly messages
- **⚡ Optimistic Updates** - Instant UI updates with rollback on failure

### 🔐 Security & Authentication
- **👤 User Authentication** - Secure login and registration system
- **🔑 JWT Tokens** - Secure session management
- **🛡️ Protected Routes** - User-specific task access
- **🔒 Password Security** - Bcrypt password hashing
- **⚡ Rate Limiting** - API protection against abuse
- **🛡️ Security Headers** - Comprehensive security middleware

### 🚄 Performance & Reliability
- **🔄 Real-time Updates** - Instant synchronization across devices
- **📱 Offline Support** - Works with limited connectivity
- **🔄 Retry Mechanisms** - Automatic retry for failed operations
- **📈 Performance Monitoring** - Built-in performance tracking
- **🛡️ Error Boundaries** - Prevents crashes from component errors
- **🧠 Memory Management** - Efficient state management and cleanup

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/axios-671ddf?style=for-the-badge&logo=axios&logoColor=white)

### Backend
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Development & Deployment
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?logo=node.js&logoColor=white) (v16 or higher)
- ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white) (local or MongoDB Atlas)
- ![npm](https://img.shields.io/badge/npm-Latest-CB3837?logo=npm&logoColor=white) or ![Yarn](https://img.shields.io/badge/yarn-Latest-2C8EBB?logo=yarn&logoColor=white)

### ⚡ Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/yourusername/taskify.git
cd taskify

# 2️⃣ Install frontend dependencies
npm install

# 3️⃣ Install backend dependencies
cd server
npm install

# 4️⃣ Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 5️⃣ Start development servers
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

### 🌐 Access Points

- **Frontend**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 📜 Available Scripts

<div align="center">

| Script | Description | Status |
|--------|-------------|--------|
| `npm run dev` | Start development server | ![Status](https://img.shields.io/badge/Status-Active-success) |
| `npm run build` | Build for production | ![Status](https://img.shields.io/badge/Status-Active-success) |
| `npm run test` | Run test suite | ![Status](https://img.shields.io/badge/Status-Active-success) |
| `npm run lint` | Run ESLint | ![Status](https://img.shields.io/badge/Status-Active-success) |
| `npm run format` | Format with Prettier | ![Status](https://img.shields.io/badge/Status-Active-success) |

</div>

## 🏗️ Project Structure

```
📦 Taskify/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📄 AddTodo.jsx          # Task creation form with due date picker
│   │   ├── 📄 TodoItem.jsx         # Individual task item with actions
│   │   ├── 📄 TodoList.jsx         # Main task list with filtering
│   │   ├── 📄 DueDateModal.jsx     # Calendar and time picker modal
│   │   ├── 📄 DragDropList.jsx     # Drag and drop container
│   │   ├── 📄 SortableTodoItem.jsx # Draggable task item wrapper
│   │   ├── 📄 SearchBar.jsx        # Task search functionality
│   │   ├── 📄 CategoryFilter.jsx   # Category filtering dropdown
│   │   ├── 📄 LoadingButton.jsx    # Button with loading states
│   │   ├── 📄 LoadingSpinner.jsx   # Loading indicator component
│   │   ├── 📄 ErrorDisplay.jsx     # Error message display
│   │   └── 📁 __tests__/           # Component test files
│   ├── 📁 context/                 # React contexts
│   │   └── 📄 AuthContext.jsx     # Authentication state management
│   ├── 📁 services/                # API service layer
│   │   └── 📄 todoService.js      # Todo CRUD operations
│   ├── 📁 utils/                   # Utility functions
│   │   ├── 📄 api.js              # HTTP client configuration
│   │   ├── 📄 errorHandler.js     # Error handling utilities
│   │   ├── 📄 retryMechanism.js   # Retry logic for failed operations
│   │   ├── 📄 operationStateManager.js # Loading state management
│   │   ├── 📄 debugUtils.js       # Development debugging tools
│   │   └── 📄 productionLogger.js # Production-safe logging
│   ├── 📄 App.jsx                 # Main application component
│   ├── 📄 main.jsx               # Application entry point
│   └── 📄 index.css              # Global styles and Tailwind imports
├── 📁 server/                      # Backend source code
│   ├── 📁 config/                 # Configuration files
│   │   ├── 📄 database.js        # MongoDB connection setup
│   │   └── 📄 security.js        # Security middleware configuration
│   ├── 📁 models/                 # Database models
│   │   ├── 📄 Todo.js           # Todo data model
│   │   └── 📄 User.js           # User data model
│   ├── 📁 routes/               # API route handlers
│   │   ├── 📄 todos.js         # Todo CRUD endpoints
│   │   └── 📄 auth.js          # Authentication endpoints
│   ├── 📁 middleware/           # Custom middleware
│   │   └── 📄 auth.js          # JWT authentication middleware
│   ├── 📁 scripts/             # Utility scripts
│   │   └── 📄 security-check.js # Pre-deployment security validation
│   └── 📄 server.js            # Express server configuration
├── 📁 docs/                    # Documentation
│   ├── 📄 SECURITY_IMPLEMENTATION.md # Security features documentation
│   ├── 📄 FRONTEND_CLEANUP.md        # Production cleanup guide
│   └── 📄 PRODUCTION_SECURITY.md     # Production deployment security
└── 📄 README.md               # You are here
```

## 🔒 Security Features

<div align="center">

### Production Security

![Security](https://img.shields.io/badge/Security-Grade%20A-success?style=for-the-badge)
![Rate Limiting](https://img.shields.io/badge/Rate%20Limiting-Active-blue?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Secured-orange?style=for-the-badge)
![CORS](https://img.shields.io/badge/CORS-Protected-green?style=for-the-badge)

</div>

- **🛡️ Environment Variable Validation** - Ensures secure configuration
- **⚡ Rate Limiting** - Prevents API abuse (100 requests/15 minutes)
- **🔒 Security Headers** - Helmet.js with CSP, HSTS, XSS protection
- **🌐 CORS Protection** - Configurable origin whitelist
- **🔑 JWT Security** - Secure token-based authentication
- **🔐 Password Hashing** - Bcrypt with salt rounds

## 🧪 Testing

<div align="center">

![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen?style=for-the-badge)
![Unit Tests](https://img.shields.io/badge/Unit%20Tests-Passing-success?style=for-the-badge)
![Integration](https://img.shields.io/badge/Integration-Passing-success?style=for-the-badge)

</div>

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🌍 Browser Support

<div align="center">

![Chrome](https://img.shields.io/badge/Chrome-90+-4285F4?logo=google-chrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-88+-FF7139?logo=firefox&logoColor=white)
![Safari](https://img.shields.io/badge/Safari-14+-000000?logo=safari&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-90+-0078D4?logo=microsoft-edge&logoColor=white)

</div>

## 🚀 Deployment

### Frontend Deployment
[![Netlify Status](https://api.netlify.com/api/v1/badges/a423929a-cca1-47d0-bead-ebb0e5042178/deploy-status)](https://app.netlify.com/projects/taskify-todo-list/deploys)

### Backend Deployment
[![Render Status](https://img.shields.io/badge/Render-Ready-46E3B7?style=for-the-badge&logo=render&logoColor=white)]([https://render.com](https://taskify-vn8t.onrender.com))

```bash
# Build for production
npm run build

# Deploy to your hosting provider
# Set environment variables:
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
```

## 🤝 Contributing

We love contributions! Please read our contributing guidelines before getting started.

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/FoldedOdin/Taskify)](https://github.com/FoldedOdin/Taskify/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/FoldedOdin/Taskify)](https://github.com/FoldedOdin/Taskify/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/FoldedOdin/Taskify)](https://github.com/FoldedOdin/Taskify/pulls)

</div>

### Development Process

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 📥 Open a Pull Request

## 📊 Stats & Analytics

<div align="center">

![Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=FoldedOdin&layout=compact&theme=dark)

</div>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE.md) file for details.

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

</div>

## 🙏 Acknowledgments

<div align="center">

Special thanks to the amazing open source community and these fantastic projects:

[![React](https://img.shields.io/badge/Thanks-React%20Team-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Thanks-Tailwind%20Team-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/Thanks-MongoDB%20Team-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

## 📬 Connect With Me

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?logo=github&logoColor=white)](https://github.com/FoldedOdin)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?logo=twitter&logoColor=white)](https://twitter.com/FoldedOdin)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/karthikkpradeep)

</div>

---

<div align="center">

**🎯 Built with ❤️ using modern web technologies**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-rose.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-💙-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-💛-yellow.svg)

### ⭐ If you found this project helpful, please give it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=FoldedOdin/Taskify&type=Timeline)](https://star-history.com/#FoldedOdin/Taskify&Timeline)

### [📑 Return to Top](#-taskify)

</div>
