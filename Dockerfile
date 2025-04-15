# Tags passed to "go build"
ARG BUILD_TAGS=""

# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend ./
RUN npm run build
RUN npm prune --production

# Stage 2: Build Backend
FROM golang:1.24-alpine AS backend-builder
ARG BUILD_TAGS
WORKDIR /app/backend
COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download

RUN apk add --no-cache gcc musl-dev git

COPY ./backend ./
WORKDIR /app/backend/cmd/server
RUN CGO_ENABLED=1 GOOS=linux go build -tags "${BUILD_TAGS}" -o /app/backend/svelocker-backend .

# Stage 3: Production Image
FROM node:22-alpine

# Delete default node user
RUN deluser --remove-home node

RUN apk add --no-cache su-exec curl

WORKDIR /app
# Create data directory
RUN mkdir -p /app/data

# Copy frontend files
COPY --from=frontend-builder /app/frontend/build ./frontend/build
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/static ./frontend/static

# Copy backend binary
COPY --from=backend-builder /app/backend/svelocker-backend ./backend/svelocker-backend
RUN chmod +x ./backend/svelocker-backend

# Copy scripts
COPY ./scripts ./scripts
RUN chmod +x ./scripts/docker/*.sh

EXPOSE 3000
EXPOSE 8080

LABEL org.opencontainers.image.authors="kmendell"
LABEL org.opencontainers.image.description="A Simple and Modern Docker Registry UI for use with Distribution/Registry"

# Add volume for persistent data
VOLUME ["/app/data"]

ENTRYPOINT ["sh", "./scripts/docker/setup-container.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]