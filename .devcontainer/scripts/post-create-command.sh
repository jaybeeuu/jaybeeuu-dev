#!/bin/bash
pushd "$(dirname "$0")"

./gen-certs.sh "../../api/certs" "api"
./gen-certs.sh "../../client/certs" "client"

popd