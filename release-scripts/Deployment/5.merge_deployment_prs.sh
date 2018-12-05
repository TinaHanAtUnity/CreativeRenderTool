#!/usr/bin/env bash
##
# Merges all deployment PRs

releases="2.0.0-beta2 2.0.0-beta3 2.0.0-beta4 2.0.0-beta5 2.0.0-rc1 2.0.2 2.0.3 2.0.4 2.0.5 2.0.6 2.0.7 2.0.8 2.1.0 2.1.1 2.1.2 2.2.0 2.2.1 2.3.0 3.0.0"

open "https://github.com/Applifier/unity-ads-webview/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+staged+OR+staging"
read -r -p "Before continuing, CHECK THE WEBVIEW PRs for any failures. Are you sure that you would like to proceed with the deployment? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    for release in $releases; do
        # Checks out the staging branch to ensure reference to it
        git checkout "staging/$release"
        git pull
        # Checks out release branch to be merged into, merges the PR, and deletes the staging PR branch
        git checkout $release
        git pull
        git merge -m "Merge staging/$release into $release" "staging/$release"
        git push origin
        git push origin --delete "staging/$release"
    done

    sleep 1

    # Opens kibana, grafana, and travis in a browser for monitoring
    open "https://grafana.applifier.info/dashboard/db/sdk-2?refresh=30s&orgId=1&from=now-2h&to=now"
    sleep .3
    open "https://kibana.prd.log.corp.unity3d.com/app/kibana#/dashboard/6e0c34c0-0c54-11e8-a3ee-8d67f75e4519?_g=()&_a=(description:'',filters:!(),options:(darkTheme:!t),panels:!((col:1,id:'3aad1e10-0c49-11e8-a3ee-8d67f75e4519',panelIndex:1,row:1,size_x:3,size_y:2,type:visualization),(col:1,id:a8097c60-0c49-11e8-a3ee-8d67f75e4519,panelIndex:3,row:8,size_x:12,size_y:5,type:visualization),(col:6,id:'00768280-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:4,row:1,size_x:4,size_y:7,type:visualization),(col:1,id:'4665f3c0-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:5,row:3,size_x:5,size_y:5,type:visualization),(col:4,id:'7bbae800-0c4a-11e8-a3ee-8d67f75e4519',panelIndex:6,row:1,size_x:2,size_y:2,type:visualization),(col:10,id:b4cda790-0c4a-11e8-a3ee-8d67f75e4519,panelIndex:7,row:1,size_x:3,size_y:7,type:visualization)),query:(match_all:()),timeRestore:!f,title:ads-sdk2-diagnostics,uiState:(P-1:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)')))),viewMode:view)"
    sleep .3
    open "https://travis-ci.com/Applifier/unity-ads-webview/builds"
else
    echo "You have chosen to NOT to merge the deployment PRs."
fi
