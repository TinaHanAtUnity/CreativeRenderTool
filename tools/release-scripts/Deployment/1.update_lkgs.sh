#!/usr/bin/env bash
##
# Updates all LKGs for releases.

releases="tools/release-scripts/releases.txt"

echo "Staging test endpoints:"
echo "http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-ios-sans-webhook/"
echo "http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-android-sans-webhook/"

read -r -p "Before continuing, update the changelog with the deployment time and CHECK THE STAGING TESTS at the links above for correctly formatted screenshots and failures.\nAre you sure that you would like to proceed with the deployment? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    branch=$(git rev-parse --abbrev-ref HEAD)

    while IFS= read -r release
    do
        lkg="LKG_$release"
        if ! git checkout $release > /dev/null; then
            echo "Could not check out $release, check that index is clean with no pending changes."
            exit 1
        fi

        git reset --hard origin/$release
        echo "Updating $release into $lkg"
        git tag -f $lkg HEAD
        sleep 1
    done <"$releases"

    git push --tags -f

    # ads-sdk slack channel
    curl -X POST -H 'Content-type: application/json' --data '{"text":"Ads SDK will be performing a Webview Deployment shortly. Here is the changelog showing the latest updates: https://github.com/Applifier/unity-ads-webview/blob/master/CHANGELOG.md"}' https://hooks.slack.com/services/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
    # ads-deploys slack channel
    curl -X POST -H 'Content-type: application/json' --data '{"text":"Ads SDK will be performing a Webview Deployment shortly. Here is the changelog showing the latest updates: https://github.com/Applifier/unity-ads-webview/blob/master/CHANGELOG.md"}' https://hooks.slack.com/services/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

    git checkout master
    ./tools/fire_deploy_json.sh
    echo "Make sure to monitor Slack in case anyone requests that the deployment should not happen at this time!"
else
    echo "Probably a good idea. Those tests looked sketchy anyways."
    echo "Updating of LKG branches was aborted."
fi
