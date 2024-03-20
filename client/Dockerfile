# Use the official Node.js 14 image to build your app
FROM node:14 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build your app
RUN npm run build

# Use the official nginx image for a production build
FROM nginx:alpine
# changed from /app/build to /app/dist
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

