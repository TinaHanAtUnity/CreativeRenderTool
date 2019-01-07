#!/usr/bin/env bash
##
# Creates the staging branches for a deployment.


releases="tools/release-scripts/releases.txt"

git checkout master
git pull

while IFS= read -r release
do
    git checkout $release
    git pull
    git reset --hard origin/$release
    git branch -D staging/$release
    git branch staging/$release
    echo "Created branch staging/$release"
done <"$releases"

echo "Ensure that the CHANGELOG.md in the master repository includes the lastest merged PRs."
