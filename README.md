# Mongo-ExForge

A MongoDB export tool built with NestJS that allows you to export MongoDB data in various formats.

## Overview

Mongo-ExForge is designed to simplify the process of exporting MongoDB collections to different file formats. It uses a clean architecture based on Domain-Driven Design (DDD) principles, separating concerns into distinct layers.

## Features

- Export MongoDB collections to different formats (CSV, JSON, etc.)
- Query filtering for selective data export
- Field selection for partial document export
- Custom sorting options
- RESTful API with Swagger documentation
- Secure endpoints with authentication

## Project Structure

```
application/
├── src/
│   ├── app.module.ts                # Root module
│   ├── main.ts                      # Application entry point
│   ├── application/                 # Application layer (use cases)
│   ├── domain/                      # Domain layer (entities, repositories)
│   ├── infrastructure/              # Infrastructure layer (database, http)
│   ├── presentation/                # Presentation layer (controllers)
│   └── shared/                      # Shared resources (DTOs, interfaces)
```

## Getting Started

### Prerequisites

- Node.js (v20+)
- MongoDB instance (local or remote)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mongo-exforge.git
cd mongo-exforge/application
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection details and other settings
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Usage

Once the application is running, you can access the API documentation at:
```
http://localhost:3000/docs
```

### Basic Export Flow

1. Create an export job:
```bash
curl -X POST http://localhost:3000/job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Export Users",
    "export_format": "CSV",
    "collection": "users",
    "query": "{}",
    "fields": ["name", "email"]
  }'
```

2. Check job status:
```bash
curl -X GET http://localhost:3000/job?id=JOB_ID \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

3. Download the exported file using the returned file_url.

## Development

### Project Structure Details

- **Domain Layer**: Contains business logic and entities
- **Application Layer**: Contains use cases and services
- **Infrastructure Layer**: Contains database access, export services
- **Presentation Layer**: Contains API controllers

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Check test coverage
npm run test:cov
```

## Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t mongo-exforge .

# Run the container
docker run -p 3000:3000 --env-file .env mongo-exforge
```
