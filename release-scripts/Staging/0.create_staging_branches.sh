#!/usr/bin/env bash
##
# Creates the staging branches for a deployment.


releases="2.0.0-beta2 2.0.0-beta3 2.0.0-beta4 2.0.0-beta5 2.0.0-rc1 2.0.2 2.0.3 2.0.4 2.0.5 2.0.6 2.0.7 2.0.8 2.1.0 2.1.1 2.1.2 2.2.0 2.2.1 2.3.0 3.0.0"

for release in $releases; do
    git checkout $release
    git pull
    git reset --hard origin/$release
    git branch -D staging/$release
    git branch staging/$release
    echo "Created branch staging/$release"
done

echo "Ensure that the CHANGELOG.md in the master repository includes the lastest merged PRs."
