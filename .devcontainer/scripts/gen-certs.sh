#!/bin/bash

certsDir=$1
appName=$2

mkdir $certsDir

openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=UK/ST=Somerset/L=Bath/O=Josh Bickley-Wallace/CN=$appName.bickley-wallace.com" \
    -keyout "$certsDir/private.key" -out "$certsDir/certificate.crt"