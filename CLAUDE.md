# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple HTML file hosting and sharing application built with Node.js and Express. The application allows users to upload HTML files via drag-and-drop or file selection, view them online, and share them with others. It now features persistent storage using SQLite database and Zeabur's mounted disk for file persistence.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Architecture

The application follows a simple monolithic structure:

- `server.js` - Main Express server containing all routes and middleware
- `models/database.js` - Database models and initialization
- `public/index.html` - Frontend HTML with embedded CSS and JavaScript
- `uploads/` - Directory where uploaded HTML files are stored (created automatically)
- `zeabur.json` - Zeabur deployment configuration

## Key Components

### File Upload System
- Uses Multer middleware for file handling
- Supports both drag-and-drop and click-to-upload
- Generates unique filenames to prevent conflicts
- File size limit: 10MB
- Only accepts HTML files

### File Management
- SQLite database stores file metadata with persistent storage
- REST API for CRUD operations on files
- Direct file serving via `/view/:filename` endpoint
- File access tracking and statistics
- Automatic cleanup when files are deleted

### Frontend Features
- Responsive design that works on mobile and desktop
- Real-time file list updates
- Toast notifications for user feedback
- Loading states during upload operations

## File Storage

Files are stored in the `uploads/` directory, which automatically uses Zeabur's mounted disk when deployed (`ZEABUR_MOUNT_PATH` environment variable). This ensures file persistence across server restarts and deployments.

### Database Storage
- SQLite database stored in `database.sqlite` (or mounted disk if available)
- File metadata including upload date, access count, and file information
- Automatic database initialization and table creation

### Production Deployment
When deployed to Zeabur:
- Files are stored on persistent mounted disk
- Database is also stored on mounted disk for persistence
- Environment variable `ZEABUR_MOUNT_PATH` is automatically set

## Deployment

The application is configured for Zeabur deployment with automatic build and start commands. The `zeabur.json` file contains the deployment configuration.

## Limitations

- No authentication or user management
- File storage is local to the server instance (but persistent with Zeabur mounted disk)
- No built-in backup system
- No file expiration or cleanup system

## Common Development Tasks

### Adding New File Types
Modify the file filter in `server.js` to accept additional MIME types or file extensions.

### Changing File Size Limit
Update the `limits.fileSize` property in the Multer configuration.

### Adding Database Persistence
Consider integrating with a database like MongoDB or PostgreSQL to store file metadata persistently.

### Adding User Authentication
Implement authentication middleware using JWT or session-based authentication.