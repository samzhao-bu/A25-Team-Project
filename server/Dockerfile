# Use the official Node.js 14 image as a parent image FROM node:14
FROM node:20.11.1

# set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Make port 3000 available outside this container
EXPOSE 3000

# Run the application 
CMD ["node", "index.js"]

