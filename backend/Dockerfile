FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev
RUN npm install -g ts-node typescript
RUN npm install --save-dev @types/node @types/express @types/cors @types/uuid

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["ts-node", "src/server.ts"]