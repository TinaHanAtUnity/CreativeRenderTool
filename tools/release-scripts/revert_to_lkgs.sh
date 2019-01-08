#!/usr/bin/env bash
##
# Messed up? Don't panic. This should fix your problems for now.
# 

echo -n "This will revert ALL releases to the last known good tag. Do you wish to proceed? [Y/n] "
read answer

if ! [[ $answer =~ [Yy]$ ]]; then
    echo "Cancelling."
    exit 1
fi

echo "Proceeding in five seconds."
sleep 5

releases="release-scripts/releases.txt"

git pull --tags
while IFS= read -r release
    do
    git checkout $release
    git reset --hard "LKG_$release"
    git push -f
    sleep 2
done <"$releases"

curl -X POST -H 'Content-type: application/json' --data '{"text":"The latest Ads SDK Webview Deployment has been manually reverted. :slightly_frowning_face:"}' https://hooks.slack.com/services/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
curl -X POST -H 'Content-type: application/json' --data '{"text":"The latest Ads SDK Webview Deployment has been manually reverted. :slightly_frowning_face:"}' https://hooks.slack.com/services/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

echo "Get yourself a nice bottle of tequila. 🥃✨🥃"
