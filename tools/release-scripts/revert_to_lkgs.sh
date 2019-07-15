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

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

git pull --tags
while IFS= read -r release
    do
    git checkout $release
    git reset --hard "LKG_$release"
    git push -f
    sleep 1
done <"$releases"

# ads-sdk-devs slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has been reverted. :frowning:","color":"danger"}]}' https://hooks.slack.com/services/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

# ads-deploys slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has been reverted. :frowning:","color":"danger"}]}' https://hooks.slack.com/services/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

echo "Get yourself a nice bottle of tequila. 🥃✨🥃"
