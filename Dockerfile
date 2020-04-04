FROM node:stretch-slim

WORKDIR /usr/auth

COPY *.json ./
COPY *.js ./

RUN npm install
EXPOSE 5001

CMD ["node", "auth-server.js"]
