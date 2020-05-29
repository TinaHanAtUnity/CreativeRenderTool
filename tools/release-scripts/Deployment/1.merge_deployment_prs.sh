#!/usr/bin/env bash
##
# Merges all deployment PRs

git checkout master
git pull

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

echo "Pull Requests:"
echo "https://github.com/Applifier/unity-ads-webview/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+staged+OR+staging \n"

read -r -p "This will merge the remote staged branches into the release branches. Ensure the changes to your local branches are reflected in the pushed branches. Would you like to continue? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    while IFS= read -r release
    do
        # Checks out release branch to be merged into, merges the PR, and deletes the staging PR branch
        git checkout $release
        git pull
        git merge -m "Merge origin/staging/$release into $release" "origin/staging/$release"
        git push origin
        git push origin --delete "staging/$release"
    done <"$releases"

    echo "Deployment Builds Status: https://travis-ci.com/Applifier/unity-ads-webview/builds"
    echo "Performance of SDK Releases: https://app.datadoghq.com/dashboard/96g-fr5-mne/sdk-deployment-dashboard?from_ts=1586378275037&live=true&tile_size=m&to_ts=1586381875037"
else
    echo "You have chosen to NOT to merge the deployment PRs."
fi
