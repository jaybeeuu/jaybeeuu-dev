#!/bin/bash
pushd "$(dirname "$0")"

node ./edit-bashrc.js

./gen-certs.sh "../../api/certs" "api"
./gen-certs.sh "../../client/certs" "client"

popd