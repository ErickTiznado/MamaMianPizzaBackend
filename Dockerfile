FROM node:14

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]