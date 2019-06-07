FROM node:alpine

LABEL maintainer="joshbickleywallace@outlook.com"

RUN apk update && apk add yarn

WORKDIR /var/www

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install

COPY . .

CMD ["yarn", "start"]