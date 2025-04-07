# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm ci
RUN npm run build

# Stage 2: Build backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
# Install build dependencies
RUN apk add --no-cache gcc musl-dev git

# Copy go module files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy the backend source code
COPY backend/ ./
# Build the backend binary
RUN CGO_ENABLED=1 GOOS=linux go build -o server ./cmd/server

# Stage 3: Production image
FROM node:22-alpine

# Delete default node user
RUN deluser --remove-home node

RUN apk add --no-cache su-exec curl

WORKDIR /app

# Create data directory
RUN mkdir -p /app/data

# Copy frontend build
COPY --from=frontend-builder /app/build ./build
COPY frontend/package*.json ./
RUN npm install --omit=dev
COPY --from=frontend-builder /app/static ./static

# Copy backend binary
COPY --from=backend-builder /app/server ./

# Copy entrypoint script
COPY ./scripts/docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
EXPOSE 8080

LABEL org.opencontainers.image.authors="kmendell"
LABEL org.opencontainers.image.description="A Simple and Modern Docker Registry UI for use with Distribution/Registry"

# Add volume for persistent data
VOLUME ["/app/data"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Update CMD to run both frontend and backend
CMD ["sh", "-c", "./server & node build"]