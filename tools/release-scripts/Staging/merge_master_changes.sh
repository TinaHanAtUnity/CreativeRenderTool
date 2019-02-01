#!/usr/bin/env bash
##
# Merges master into each staging branch. Execution will pause if there is
# a merge conflict.

git checkout master
git pull

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

while IFS= read -r release
do
    git checkout staging/$release
    git merge master
    if [ "$?" -eq "1" ]; then
        git status | grep 'deleted by us' | sed 's/^.*deleted by us: //g' | xargs git rm
        echo "Resolve merge conflicts then proceed by pressing any key."
        read answer < /dev/tty
    fi
done <"$releases"

