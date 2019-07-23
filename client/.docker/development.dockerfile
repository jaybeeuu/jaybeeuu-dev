FROM node:alpine

LABEL maintainer="joshbickleywallace@outlook.com"

RUN apk update && apk add yarn

WORKDIR /var/www

COPY ./package.json .

RUN npm install

COPY . .

CMD ["npm", "run-script", "start"]