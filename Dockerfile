FROM node:14.5.0-stretch
WORKDIR /usr/src/submissionbox-backend
ENV PATH /usr/src/submissionbox-backend/node_modules/.bind:$PATH
COPY package*.json ./
RUN npm install
COPY . .
CMD ["/bin/bash", "npm", "start"]