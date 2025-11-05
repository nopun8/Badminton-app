# Stage 1: Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./ 
RUN npm run build

# Stage 2: Final image
FROM node:18-alpine
WORKDIR /app

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy backend source
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --omit=dev
RUN npm install -g ts-node typescript
RUN npm install --save-dev @types/node @types/express @types/cors @types/uuid

# Make backend folder writable (for data.json)
RUN chmod -R 777 /app/backend

# Expose only backend port
EXPOSE 5000

# Start backend (serving frontend too)
WORKDIR /app
CMD sh -c "cd backend && ts-node src/server.ts & npx serve -s frontend/build -l 3000"
