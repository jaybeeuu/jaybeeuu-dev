#!/bin/bash

pushd "$(dirname "$0")"

rootCertsDir="../certs"
rm -rf $rootCertsDir
mkdir $rootCertsDir

bickleyWallaceKey="$rootCertsDir/bickley-wallace-ca.key"
bickleyWallaceCrt="$rootCertsDir/bickley-wallace-ca.crt"

openssl req -new -sha256 -newkey rsa -nodes \
    -x509 -subj "/C=UK/ST=Somerset/L=Bath/O=Josh Bickley-Wallace/CN=bickley-wallace.com" \
    -keyout $bickleyWallaceKey -out $bickleyWallaceCrt

do-gen-certs () {
    certsDir=$1
    rm -rf $certsDir
    mkdir $certsDir

    localhostKey="$certsDir/localhost.key"
    localhostCsr="$certsDir/localhost.csr"
    localhostCrt="$certsDir/localhost.crt"

    openssl req -new -sha256 -newkey rsa -nodes \
        -subj "/C=UK/ST=Somerset/L=Bath/O=Josh Bickley-Wallace/CN=localhostnpm start" \
        -keyout $localhostKey -out $localhostCsr

    openssl x509 -req -in $localhostCsr \
        -CA $bickleyWallaceCrt -CAkey $bickleyWallaceKey -CAcreateserial \
        -out $localhostCrt
}

do-gen-certs "../packages/api/certs"
do-gen-certs "../packages/client/certs"

popd