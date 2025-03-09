FROM node:18-alpine

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG SERVER_PORT
ENV PORT=${SERVER_PORT}

EXPOSE ${PORT}

# Start the server
CMD ["node", "index.js"]
