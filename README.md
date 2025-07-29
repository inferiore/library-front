# Library Management System - React Frontend

This is the React frontend for the Library Management System, built with Create React App and TypeScript. The application provides a user-friendly interface for both librarians and members to manage books, borrowings, and view dashboard analytics.

## Features

- **Authentication System**: Secure login for librarians and members
- **Dashboard**: Role-based dashboards with statistics and recent activity
- **Book Management**: Browse, search, and manage library books
- **Borrowing System**: Handle book borrowings and returns
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization with the backend API

## Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Zustand** for state management
- **React Hooks** for component logic
- **CSS-in-JS** for styling

## Prerequisites

- **Docker** and **Docker Compose** installed on your system
- **Git** for cloning the repositories

## Deployment with Docker

### 1. Clone the Repositories

First, clone both the backend and frontend repositories:

```bash
# Clone the backend repository
git clone https://github.com/inferiore/library-back.git library

# Clone the frontend repository
git clone https://github.com/inferiore/library-front.git library-react
```

Your directory structure should look like:
```
.
├── library/           # Backend (Laravel API)
└── library-react/     # Frontend (React App)
```

### 2. Start the Full Stack

Navigate to the backend directory and start all services:

```bash
cd library
docker-compose up --build
```

This will start:
- **MySQL Database** on port `3306`
- **Laravel Backend API** on port `8000`
- **React Frontend** on port `3000`

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:3306

### 4. Demo Credentials

Use these credentials to test the application:

**Librarian Account:**
- Email: `librarian@library.com`
- Password: `password123`

**Member Account:**
- Email: `alice@example.com`
- Password: `password123`

## Development Workflow

### Hot Reloading

The Docker setup includes volume mounting for development:
- Changes to React components in `library-react/src/` are automatically reflected in the container
- No need to rebuild the container for code changes

### Making Changes

1. Edit files in your local `library-react/src/` directory
2. Changes will automatically trigger hot reloading in the browser
3. The development server will reflect changes in real-time

### Container Management

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs react-app

# Rebuild specific service
docker-compose up --build react-app

# Access container shell
docker exec -it library_react_app sh
```

## Troubleshooting

### Port Conflicts
If ports 3000, 8000, or 3306 are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Container Won't Start
```bash
# Check container logs
docker-compose logs react-app

# Rebuild from scratch
docker-compose down --volumes
docker-compose up --build
```

### API Connection Issues
- Ensure the backend container is running and healthy
- Check that `REACT_APP_API_URL` points to the correct backend URL
- Verify network connectivity between containers

## Available Scripts (Non-Docker)

If you want to run the app locally without Docker:

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder
