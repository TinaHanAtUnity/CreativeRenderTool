#!/usr/bin/env bash
##
# Creates the deployment pull requests.

releases="2.0.0-beta2 2.0.0-beta3 2.0.0-beta4 2.0.0-beta5 2.0.0-rc1 2.0.2 2.0.3 2.0.4 2.0.5 2.0.6 2.0.7 2.0.8 2.1.0 2.1.1 2.1.2 2.2.0 2.2.1 2.3.0 3.0.0"

hub=$(which hub || (echo "Hub not on PATH" && exit 1))

msg=$1

pr_message() {
    local release=$1
    if [ -z "$msg" ]; then
        echo "Staged Deployment [$release]"
    else
        echo "$msg"
    fi;
}

for release in $releases; do
    git checkout "staging/$release"
    hub pull-request -b $release -h "staging/$release" -m "$(pr_message $release)"
    sleep 2
done

echo "Deployment PRs made."
open "https://github.com/Applifier/unity-ads-webview/pulls"

#ads-sdk slack channel
curl -X POST -H 'Content-type: application/json' --data '{"text":"Ads SDK Webview Deployment has been staged for a deployment with the following changes: https://github.com/Applifier/unity-ads-webview/blob/master/CHANGELOG.md"}' https://hooks.slack.com/services/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
