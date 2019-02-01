#!/usr/bin/env bash

git checkout master
git pull

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/release-scripts/releases.txt"

while IFS= read -r release
do
    git checkout staging/$release
    git push origin staging/$release
done <"$releases"
