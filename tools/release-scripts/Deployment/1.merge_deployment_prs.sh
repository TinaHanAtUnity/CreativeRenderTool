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

    # Opens kibana and travis in a browser for monitoring
    echo "Links to monitoring resources:"
    echo "https://kibana.prd.log.corp.unity3d.com/app/kibana#/dashboard/6e0c34c0-0c54-11e8-a3ee-8d67f75e4519?_g=()&_a=(description:'',filters:!(),options:(darkTheme:!t),panels:!((col:1,id:'3aad1e10-0c49-11e8-a3ee-8d67f75e4519',panelIndex:1,row:1,size_x:3,size_y:2,type:visualization),(col:1,id:a8097c60-0c49-11e8-a3ee-8d67f75e4519,panelIndex:3,row:8,size_x:12,size_y:5,type:visualization),(col:6,id:'00768280-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:4,row:1,size_x:4,size_y:7,type:visualization),(col:1,id:'4665f3c0-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:5,row:3,size_x:5,size_y:5,type:visualization),(col:4,id:'7bbae800-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:6,row:1,size_x:2,size_y:2,type:visualization),(col:10,id:b4cda790-0c4a-11e8-a3ee-8d67f75e4519,panelIndex:7,row:1,size_x:3,size_y:7,type:visualization)),query:(match_all:()),timeRestore:!f,title:ads-sdk2-diagnostics,uiState:(P-1:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)')))),viewMode:view)"
    echo "https://travis-ci.com/Applifier/unity-ads-webview/builds"
else
    echo "You have chosen to NOT to merge the deployment PRs."
fi
