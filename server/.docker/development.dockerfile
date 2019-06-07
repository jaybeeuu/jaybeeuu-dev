FROM nginx

LABEL maintainer="joshbickleywallace@outlook.com"

RUN mv /etc/nginx/nginx.conf /etc/nginx/orig.nginx.conf

COPY ./conf /etc/nginx

WORKDIR /var/www

COPY ./static ./static