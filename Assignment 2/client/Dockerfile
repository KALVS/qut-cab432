FROM node:6.5

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src
ADD package.json package.json
RUN npm install