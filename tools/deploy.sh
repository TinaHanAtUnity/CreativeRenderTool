#!/usr/bin/env bash

# Exit script when a command fails
set -e
# Output every command
set -x

# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
trap 'echo "\"${last_command}\" command filed with exit code $?."' EXIT

if [ $# != 1 ]; then
    echo "Usage: deploy.sh <branch name>"
    exit 1
fi

BRANCH=$1

if [ $BRANCH == 2.0.6 ]; then
    BRANCH='master'
elif [ $BRANCH == master ]; then
    BRANCH='development'
fi

gsutil -m cp -r -z "html, json" -a public-read deploy gs://unity-ads-webview-bucket/webview/$BRANCH
aws s3 sync deploy s3://unityads-cdn-origin/webview/$BRANCH/ --acl public-read

if [ $BRANCH == master ]; then
    gsutil -m cp -r -z "html, json" -a public-read deploy gs://unity-ads-webview-bucket/webview/2.0.6
    aws s3 sync deploy s3://unityads-cdn-origin/webview/2.0.6/ --acl public-read
fi