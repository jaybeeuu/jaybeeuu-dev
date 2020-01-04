#!/bin/bash

mkdir ../certs

openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=UK/ST=Somerset/L=Bath/O=Josh Bickley-Wallace/CN=api.bickley-wallace.com" \
    -keyout ../certs/private.key  -out ../certs/certificate.crt