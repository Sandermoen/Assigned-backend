FROM node:14.5.0-stretch
WORKDIR /usr/src/assigned-backend
ENV PATH /usr/src/assigned-backend/node_modules/.bind:$PATH
COPY package*.json ./
RUN npm install
COPY . .
CMD ["/bin/bash", "npm", "start"]