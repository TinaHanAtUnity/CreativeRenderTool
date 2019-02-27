#!/usr/bin/env bash

# Exit script when a command fails
set -e
# Output every command
set -x

# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
trap 'echo "\"${last_command}\" command filed with exit code $?."' EXIT

deploy_branch () {
    gsutil -m cp -r -z "html, json" -a public-read deploy gs://unity-ads-webview-bucket/webview/$1
    aws s3 sync deploy s3://unityads-cdn-origin/webview/$1/ --acl public-read
}

if [ $# != 1 ]; then
    echo "Usage: deploy.sh <branch name>"
    exit 1
fi

BRANCH=$1

if [ $BRANCH == 2.0.6 ]; then
    deploy_branch $BRANCH
    BRANCH='master'
elif [ $BRANCH == 3.0.1 ]; then
    deploy_branch $BRANCH
    BRANCH='3.0.1-rc2'
elif [ $BRANCH == master ]; then
    BRANCH='development'
fi

deploy_branch $BRANCH
