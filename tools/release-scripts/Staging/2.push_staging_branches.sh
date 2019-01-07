#!/usr/bin/env bash

releases="tools/release-scripts/releases.txt"

while IFS= read -r release
do
    git checkout staging/$release
    git push origin staging/$release
    sleep 2
done;
