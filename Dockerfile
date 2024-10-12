FROM node:12.7.0

WORKDIR /src

ADD package.json .

RUN npm install

ADD . .

COPY tracing/  /src/end-user/




