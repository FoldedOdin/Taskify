# Taskify - Todo Application

A modern, full-stack todo application built with React, Vite, and TailwindCSS.

## Features

- ✅ Add new tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Delete tasks
- ✅ Inline editing (double-click to edit)
- ✅ Task counter
- 🚧 Backend API integration (coming soon)
- 🚧 User authentication (coming soon)
- 🚧 Advanced features (categories, priorities, etc.)

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

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Express.js (planned)
- **Database**: MongoDB (planned)
- **Authentication**: JWT (planned)

## Project Structure

```
src/
├── components/          # React components
│   ├── AddTodo.jsx     # Add new todo form
│   ├── TodoItem.jsx    # Individual todo item
│   └── TodoList.jsx    # Main todo list container
├── context/            # React contexts
│   └── AuthContext.jsx # Authentication context (planned)
├── utils/              # Utility functions
│   └── api.js          # API client (planned)
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Development Roadmap

This project follows a spec-driven development approach with the following phases:

1. ✅ **Phase 1**: Basic UI Components
2. 🚧 **Phase 2**: Backend API
3. 🚧 **Phase 3**: Frontend-Backend Integration
4. 🚧 **Phase 4**: User Authentication
5. 🚧 **Phase 5**: Advanced Features
6. 🚧 **Phase 6**: Deployment & Production
