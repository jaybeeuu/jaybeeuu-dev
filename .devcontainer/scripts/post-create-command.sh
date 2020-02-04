#!/bin/bash
pushd "$(dirname "$0")"

./gen-certs.sh "../../api/certs"
./gen-certs.sh "../../client/certs"

popd