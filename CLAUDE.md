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
- Uses MD5 hash of file content as filename to ensure consistency
- Automatic file deduplication - identical files share the same filename
- File size limit: 10MB
- Only accepts HTML files

### File Management
- SQLite database stores file metadata with persistent storage
- REST API for CRUD operations on files
- Direct file serving via `/view/:filename` endpoint (public access, no authentication required)
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

## Authentication & Security

The application implements a session-based authentication system:
- Admin panel requires password authentication for file management (upload, delete, statistics)
- Public HTML file viewing via `/view/:filename` links requires no authentication for easy sharing
- Session management using express-session with configurable timeout
- Environment variable `LOGIN_PASSWORD` sets the admin password (defaults to 'admin123')

## File Migration and Compatibility

The application includes automatic migration functionality to ensure sharing links remain valid across deployments:

### Automatic File Migration
- On startup, the system detects files with old random filenames (16-character hex strings)
- Automatically converts them to MD5 hash-based filenames
- Preserves all file metadata and access statistics
- Removes duplicate files with identical content
- Ensures backward compatibility with existing sharing links

### Migration Process
1. **Detection**: Identifies files using the old random naming scheme
2. **Hash Generation**: Calculates MD5 hash of file content
3. **File Renaming**: Renames files to use hash-based names
4. **Database Update**: Updates file records in the database
5. **Deduplication**: Removes duplicate files with identical content

### Benefits
- **Persistent Sharing Links**: Links remain valid after redeployment
- **Storage Efficiency**: Automatic deduplication saves disk space
- **Consistency**: Same file content always has the same filename
- **Zero Downtime**: Migration happens automatically during startup

## Limitations

- Single admin user authentication (no multi-user support)
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

### Modifying Authentication
The application uses session-based authentication. To modify authentication behavior:
- Admin routes: Add/remove `requireAuth` middleware in `server.js`
- Public sharing: Keep `/view/:filename` route without `requireAuth` for public access