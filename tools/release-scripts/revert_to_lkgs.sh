#!/usr/bin/env bash
##
# Fucked up? Better make sure Ville knows.
# 

echo -n "This will revert ALL releases to the last known good tag. Do you wish to proceed? [Y/n] "
read answer

if ! [[ $answer =~ [Yy]$ ]]; then
    echo "Cancelling."
    exit 1
fi

echo "Proceeding in five seconds."
sleep 5

releases=$(git tag -l | grep LKG | grep -v ios | grep -v '2.2.0-beta1' | grep -v '2.2.1-preview.1' | sed 's/LKG_//')

git pull --tags
for release in $releases; do
    git checkout $release
    git reset --hard "LKG_$release"
    git push -f
    sleep 2
done

curl -X POST -H 'Content-type: application/json' --data '{"text":"The latest Ads SDK Webview Deployment has been manually reverted. :slightly_frowning_face:"}' https://hooks.slack.com/services/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
curl -X POST -H 'Content-type: application/json' --data '{"text":"The latest Ads SDK Webview Deployment has been manually reverted. :slightly_frowning_face:"}' https://hooks.slack.com/services/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

echo "Get yourself a nice bottle of tequila. 🥃✨🥃"
