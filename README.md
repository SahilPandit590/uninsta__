# Uninsta Backend

A robust Node.js backend for the academic resource-sharing platform "Uninsta". This API is refactored in TypeScript and uses Express, MongoDB (Mongoose), and Cloudflare R2 (S3-compatible) for file storage.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (Atlas or local)
- Cloudflare R2 / AWS S3 account with a bucket and public-read access configured

## Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   **Required Variables:**
   - `PORT`: API Port (e.g., 5000)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for signing JWT tokens
   - `R2_BUCKET_NAME`: Name of your Cloudflare R2 Bucket
   - `R2_ENDPOINT`: Your R2 API endpoint
   - `R2_ACCESS_KEY_ID`: Cloudflare R2 Access Key
   - `R2_SECRET_ACCESS_KEY`: Cloudflare R2 Secret

## Running the Application

### Development
Run the development server with hot-reload:
```bash
npm run dev
```

### Production
Build the TypeScript code and start the server:
```bash
npm run build
npm start
```

## Testing
To run the automated integration tests (uses in-memory MongoDB):
```bash
npm test
```

## Frontend Integration
This backend API is designed to pair perfectly with a React & Bootstrap frontend. Ensure your frontend application consumes the endpoints prefixed with `/api` (or `/` if running locally directly against the Node instance). CORS is configured to accept incoming requests gracefully.

## Deployment
This backend is configured for deployment on Vercel. Ensure you add all `.env` variables to your Vercel project settings before deploying.

## API Routes

### Authentication (`/auth`)
- `GET /auth/login` - Load the login page.
- `POST /auth/register` - Register a new user. Expects user details in the body.
- `POST /auth/login` - Authenticate a user and return a JWT token. Expects credentials in the body.

### Posts (`/posts`)
- `GET /posts` - Retrieve all posts. Supports optional query parameter `?subjectCategory=...` for filtering.
- `GET /posts/:id` - Retrieve a specific post by its ID.
- `POST /posts` - Create a new post. Requires authentication (`Authorization` header) and `multipart/form-data` with a `pdf` file.
- `POST /posts/:id/comments` - Add a comment to a specific post. Requires authentication and expects `text` in the body.
