#!/bin/bash

pushd "$(dirname "$0")"

do-gen-certs () {
    certsDir=$1

    mkdir $certsDir

    openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
        -subj "/C=UK/ST=Somerset/L=Bath/O=Josh Bickley-Wallace/CN=localhost" \
        -keyout "$certsDir/private.key" -out "$certsDir/certificate.crt"
}

do-gen-certs "../packages/api/certs"
do-gen-certs "../packages/client/certs"

popd