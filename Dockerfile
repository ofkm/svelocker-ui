# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
RUN mkdir -p /app/data && chown node:node /app/data
COPY package*.json ./
RUN npm install
COPY . .
RUN npm ci
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine
WORKDIR /app

# Create data directory
COPY ./scripts/docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY --from=builder /app/build ./build
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/static ./static

# Switch to non-root user
USER node

EXPOSE 3000
LABEL org.opencontainers.image.authors="kmendell"
LABEL org.opencontainers.image.description="A Simple and Modern Docker Registry UI for use with Distribution/Registry"

# Add volume for persistent data
VOLUME ["/app/data"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "build"]