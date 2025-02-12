# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm ci
RUN npm run build
RUN npm prune --production

# Stage 2: Production Image
FROM node:22-alpine
# Delete default node user
RUN deluser --remove-home node

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY ./scripts ./scripts
RUN chmod +x ./scripts/*.sh

EXPOSE 3000
LABEL org.opencontainers.image.authors="kmendell"

CMD ["sh", "./scripts/docker/entrypoint.sh"]