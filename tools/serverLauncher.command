#!/bin/bash

echo -en "\\033]0;WebView Local Server\\a"
resize -s 90 150
clear

THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)

cd $THIS_DIR/../ && python3 -m http.server

if [[ -z "$CI" ]]; then
  echo "Process terminated. Press <enter> to close the window"
  read -r
fiß