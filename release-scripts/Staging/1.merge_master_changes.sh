#!/usr/bin/env bash
##
# Merges master into each staging branch. Execution will pause if there is
# a merge conflict.

releases="2.0.0-beta2 2.0.0-beta3 2.0.0-beta4 2.0.0-beta5 2.0.0-rc1 2.0.2 2.0.3 2.0.4 2.0.5 2.0.6 2.0.7 2.0.8 2.1.0 2.1.1 2.1.2 2.2.0 2.2.1 2.3.0 3.0.0"

git checkout master
git pull

for release in $releases; do
    git checkout staging/$release
    git reset --hard origin/staging/$release
    git merge master
    if [ "$?" -eq "1" ]; then
        git status | grep 'deleted by us' | sed 's/^.*deleted by us: //g' | xargs git rm
        echo "Resolve merge conflicts then proceed."
        read
    fi
    sleep 1
done

