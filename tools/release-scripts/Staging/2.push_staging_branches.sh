#!/usr/bin/env bash

git checkout master
git pull

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

while IFS= read -r release
do
    git checkout staging/$release
    git push origin staging/$release
    sleep 5
done <"$releases"


if [ -f ".staginglock" ]; then
    echo "Sending slack notification..."

    ts=$(cat .staginglock | jq '.message.ts')
    slackjson=$(cat <<EOF
{
    "channel": "GDTR512F2",
    "text": "Staging completed and all changes pushed to GitHub.",
    "thread_ts": $ts
}
EOF
)
    # ads-sdk-devs slack channel
    curl -X POST \
        -H 'Content-type: application/json' \
        -H "Authorization: Bearer xoxp-6355312211-143460327904-1105938830800-c62d727b3197062e78ff08fec369fe8b" \
        --data "$slackjson" \
        https://slack.com/api/chat.postMessage
fi

rm .staginglock
