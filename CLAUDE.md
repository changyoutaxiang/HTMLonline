# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple HTML file hosting and sharing application built with Node.js and Express. The application allows users to upload HTML files via drag-and-drop or file selection, view them online, and share them with others.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Architecture

The application follows a simple monolithic structure:

- `server.js` - Main Express server containing all routes and middleware
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
- In-memory array stores file metadata (not persistent across restarts)
- REST API for CRUD operations on files
- Direct file serving via `/view/:filename` endpoint

### Frontend Features
- Responsive design that works on mobile and desktop
- Real-time file list updates
- Toast notifications for user feedback
- Loading states during upload operations

## File Storage

Files are stored locally in the `uploads/` directory. In production environments, consider using cloud storage solutions like AWS S3 or similar services for persistence and scalability.

## Deployment

The application is configured for Zeabur deployment with automatic build and start commands. The `zeabur.json` file contains the deployment configuration.

## Limitations

- File metadata is stored in memory and lost on server restart
- No authentication or user management
- No database integration
- File storage is local to the server instance

## Common Development Tasks

### Adding New File Types
Modify the file filter in `server.js` to accept additional MIME types or file extensions.

### Changing File Size Limit
Update the `limits.fileSize` property in the Multer configuration.

### Adding Database Persistence
Consider integrating with a database like MongoDB or PostgreSQL to store file metadata persistently.

### Adding User Authentication
Implement authentication middleware using JWT or session-based authentication.