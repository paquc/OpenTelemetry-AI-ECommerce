FROM node:20.11.0

WORKDIR /src
ADD package.json .
RUN npm install

ADD . .

