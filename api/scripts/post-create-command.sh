#!/bin/bash

pushd "$(dirname "$0")"

ls -al

./gen-certs.sh

popd