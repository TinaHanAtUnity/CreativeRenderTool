#!/usr/bin/env bash

releases="release-scripts/releases.txt"

while IFS= read -r release
do
    git checkout staging/$release
    git push origin staging/$release
    sleep 2
done;
