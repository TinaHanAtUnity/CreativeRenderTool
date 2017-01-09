#!/usr/bin/env bash

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

aws s3 sync build s3://unityads-cd-origin/webview/$BRANCH/ --acl public-read --dryrun

if [ $BRANCH == master ]; then
    aws s3 sync build s3://unityads-cdn-origin/webview/2.0.6/ --acl public-read --dryrun
fi
