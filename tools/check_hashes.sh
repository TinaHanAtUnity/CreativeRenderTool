#!/bin/bash

if [ $# != 1 ]; then
    echo "Usage: check_hashes.sh <branch name>"
    exit 1
fi

BRANCH=$1
CONFIG_URL="https://config.unityads.unity3d.com/webview/$BRANCH/release/config.json"
WEBVIEW_URL="https://webview.unityads.unity3d.com/webview/$BRANCH/release/index.html"

CONFIG_JSON=`curl -s $CONFIG_URL`
CONFIG_HASH=`echo $CONFIG_JSON | jq -r .hash`
CONFIG_VERSION=`echo $CONFIG_JSON | jq -r .version`
WEBVIEW_HASH=`curl -s $WEBVIEW_URL | openssl dgst -sha256 | sed 's/^.*= //'`

echo "Version: $CONFIG_VERSION"
echo "Hash: $CONFIG_HASH"
echo "Actual Hash: $WEBVIEW_HASH"

if [ $CONFIG_HASH != $WEBVIEW_HASH ]; then
    echo "MISMATCH!"
    exit 1
else
    echo "OK!"
fi