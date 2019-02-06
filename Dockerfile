# Use following version of Node as the base image
# IMPORTANT: Node version can not be updated till the sqlite3 package supports node 10
FROM node:9

# Set work directory for run/cmd
WORKDIR /app

# Copy package.json into work directory and install dependencies
COPY package.json /app/package.json
RUN npm install --production

# Copy everthing else in work directory
COPY . /app

# Expose server port
EXPOSE 3000

# Run node
CMD ["node", "/app/index.js"]
