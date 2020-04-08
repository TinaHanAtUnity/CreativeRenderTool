#!/usr/bin/env bash
##
# Removes local release and staging branches.

git checkout master

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

while IFS= read -r release
do
    git branch -D staging/$release
    git branch -D $release
done <"$releases"

echo "Local staging and release branches removed."
