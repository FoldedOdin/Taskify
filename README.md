# Taskify - Advanced Todo Application

A modern, full-stack todo application with comprehensive task management features, built with React, Express.js, and MongoDB.

## ✨ Features

###  Core Task Management
- ✅ **Add Tasks** - Create new tasks with rich details
- ✅ **Task Completion** - Mark tasks as complete/incomplete with visual feedback
- ✅ **Delete Tasks** - Remove tasks with confirmation and rollback
- ✅ **Inline Editing** - Double-click any task to edit text directly
- ✅ **Task Counter** - Real-time count of active and completed tasks

###  Advanced Scheduling
- ✅ **Due Date & Time** - Set precise due dates and times with calendar picker
- ✅ **Smart Time Selection** - 12-hour format with AM/PM selector
- ✅ **Past Date Prevention** - Prevents setting due dates in the past
- ✅ **Overdue Indicators** - Visual alerts for overdue tasks
- ✅ **Due Soon Alerts** - Highlights tasks due within 24 hours

###  Organization & Categorization
- ✅ **Categories** - Organize tasks by Work, Personal, Shopping, Health
- ✅ **Priority Levels** - Set High, Medium, or Low priority
- ✅ **Tags System** - Add custom tags and use predefined quick tags
- ✅ **Category Filtering** - Filter tasks by category
- ✅ **Search Functionality** - Search tasks by text content

###  User Experience
- ✅ **Drag & Drop Reordering** - Reorder tasks with intuitive drag and drop
- ✅ **Dark Mode Support** - Automatic dark/light theme switching
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Loading States** - Visual feedback during all operations
- ✅ **Error Handling** - Graceful error recovery with user-friendly messages
- ✅ **Optimistic Updates** - Instant UI updates with rollback on failure

###  Security & Authentication
- ✅ **User Authentication** - Secure login and registration system
- ✅ **JWT Tokens** - Secure session management
- ✅ **Protected Routes** - User-specific task access
- ✅ **Password Security** - Bcrypt password hashing
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **Security Headers** - Comprehensive security middleware

###  Performance & Reliability
- ✅ **Real-time Updates** - Instant synchronization across devices
- ✅ **Offline Support** - Works with limited connectivity
- ✅ **Retry Mechanisms** - Automatic retry for failed operations
- ✅ **Performance Monitoring** - Built-in performance tracking
- ✅ **Error Boundaries** - Prevents crashes from component errors
- ✅ **Memory Management** - Efficient state management and cleanup

###  Quality Assurance
- ✅ **Comprehensive Testing** - Unit, integration, and E2E tests
- ✅ **Type Safety** - PropTypes validation for components
- ✅ **Code Quality** - ESLint and Prettier configuration
- ✅ **Security Auditing** - Automated vulnerability scanning
- ✅ **Performance Testing** - Load testing and optimization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **@dnd-kit** - Modern drag and drop library
- **Axios** - HTTP client for API communication
- **React Testing Library** - Component testing utilities

### Backend
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security
- **Helmet** - Security middleware for Express
- **Rate Limiting** - API protection and throttling

### Development & Deployment
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting and style consistency
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP assertion library for API testing
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
Taskify/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── AddTodo.jsx          # Task creation form with due date picker
│   │   ├── TodoItem.jsx         # Individual task item with actions
│   │   ├── TodoList.jsx         # Main task list with filtering
│   │   ├── DueDateModal.jsx     # Calendar and time picker modal
│   │   ├── DragDropList.jsx     # Drag and drop container
│   │   ├── SortableTodoItem.jsx # Draggable task item wrapper
│   │   ├── SearchBar.jsx        # Task search functionality
│   │   ├── CategoryFilter.jsx   # Category filtering dropdown
│   │   ├── LoadingButton.jsx    # Button with loading states
│   │   ├── LoadingSpinner.jsx   # Loading indicator component
│   │   ├── ErrorDisplay.jsx     # Error message display
│   │   └── __tests__/           # Component test files
│   ├── context/                 # React contexts
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── services/                # API service layer
│   │   └── todoService.js      # Todo CRUD operations
│   ├── utils/                   # Utility functions
│   │   ├── api.js              # HTTP client configuration
│   │   ├── errorHandler.js     # Error handling utilities
│   │   ├── retryMechanism.js   # Retry logic for failed operations
│   │   ├── operationStateManager.js # Loading state management
│   │   ├── debugUtils.js       # Development debugging tools
│   │   └── productionLogger.js # Production-safe logging
│   ├── App.jsx                 # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── server/                     # Backend source code
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection setup
│   │   └── security.js        # Security middleware configuration
│   ├── models/                # Database models
│   │   ├── Todo.js           # Todo data model
│   │   └── User.js           # User data model
│   ├── routes/               # API route handlers
│   │   ├── todos.js         # Todo CRUD endpoints
│   │   └── auth.js          # Authentication endpoints
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # JWT authentication middleware
│   ├── scripts/             # Utility scripts
│   │   └── security-check.js # Pre-deployment security validation
│   └── server.js            # Express server configuration
├── docs/                    # Documentation
│   ├── SECURITY_IMPLEMENTATION.md # Security features documentation
│   ├── FRONTEND_CLEANUP.md        # Production cleanup guide
│   └── PRODUCTION_SECURITY.md     # Production deployment security
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Taskify
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # In server directory, copy example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend server
   cd ..
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3001

### 🔧 Available Scripts

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

#### Backend Scripts
```bash
npm run dev              # Start development server with nodemon
npm run start            # Start production server
npm run test             # Run API tests
npm run security:check   # Run security validation
npm run security:audit   # Check for vulnerabilities
```

## 🔒 Security Features

### Production Security
- **Environment Variable Validation** - Ensures secure configuration
- **Rate Limiting** - Prevents API abuse (100 requests/15 minutes)
- **Security Headers** - Helmet.js with CSP, HSTS, XSS protection
- **CORS Protection** - Configurable origin whitelist
- **JWT Security** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses without data leakage

### Development Security
- **Automated Security Checks** - Pre-deployment validation
- **Dependency Scanning** - Regular vulnerability audits
- **Code Quality** - ESLint security rules
- **Debug Mode Controls** - Production-safe logging

## 🧪 Testing

### Frontend Testing
```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode for development
npm run test:coverage          # Generate coverage report
```

### Backend Testing
```bash
cd server
npm run test                   # Run API tests
npm run test:integration       # Integration tests
npm run test:security         # Security-focused tests
```

### Test Coverage
- **Unit Tests** - Individual component and function testing
- **Integration Tests** - API endpoint and database testing
- **E2E Tests** - Complete user workflow testing
- **Security Tests** - Authentication and authorization testing
- **Performance Tests** - Load testing and optimization

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🌟 Key Features Showcase

### Smart Due Date Management
- Interactive calendar with month navigation
- Time picker with AM/PM selection (fixed clipping issues)
- Past date prevention with validation
- Visual indicators for overdue and due-soon tasks

### Advanced Task Organization
- **Tags System** - Custom tags with predefined quick tags
- **Category Filtering** - Work, Personal, Shopping, Health categories
- **Priority Management** - High, Medium, Low priority levels
- **Search & Filter** - Real-time search with category filters

### Drag & Drop Interface
- Intuitive task reordering with visual feedback
- React 19 compatible drag and drop implementation
- Smooth animations and transitions
- Touch-friendly for mobile devices

### Real-time Collaboration Ready
- WebSocket support for real-time updates
- Optimistic UI updates with rollback
- Conflict resolution for concurrent edits
- Multi-device synchronization

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend Deployment (Heroku/Railway/DigitalOcean)
```bash
cd server
# Set environment variables in your hosting provider
# Deploy server/ folder
```

### Environment Variables for Production
```bash
# Backend (.env)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# Security (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Run security checks before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB team for the flexible database
- All contributors and testers

---

**Built with ❤️ using modern web technologies**