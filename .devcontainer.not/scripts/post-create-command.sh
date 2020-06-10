#!/bin/bash
pushd "$(dirname "$0")"

node ./edit-bashrc.js

popd