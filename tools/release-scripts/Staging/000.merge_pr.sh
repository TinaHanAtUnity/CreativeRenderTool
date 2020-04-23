#!/usr/bin/env bash
##
# Merges PR to master branch and updates change log file

pr=$1

echo -e "Fetching infromation for PR $pr..."
info=$(hub pr show -f '%sH %pS %U %H' $pr)
labels=$(hub pr show -f '%L' $pr)

head=$(echo $info | awk '{print $1}')
state=$(echo $info | awk '{print $2}')
url=$(echo $info | awk '{print $3}')
branch=$(echo $info | awk '{print $4}')

if [ "$state" != "open" ]; then
    echo "PR should be opened before it can be merged, current PR state: $state"
    exit
fi

if [[ $labels == *"Do Not Merge"* ]]; then
    echo "PR has DO NOT MERGE label."
    exit
fi

echo -e "Fetching PR CI check status..."
status=$(hub ci-status $head)

if [ "$status" != "success" ]; then
    echo "Cannot merge PR since CI check didn't pass"
    exit
fi

echo "Attempt to merge PR locally..."

git checkout master
git pull

hub merge $url

if [ "$?" -ne "0" ]; then
    git merge --abort
    echo "Failed to merge PR due to conflicts, aborting."
    exit
fi

echo "Updating changelog..."

log=$(hub pr show -f '* %t [%i](%U)' $pr)

read -r firstline<CHANGELOG.md

if [ "$firstline" == "# Pending" ]; then
    ex -s -c "3i|$log" -cx CHANGELOG.md
else
    ex -s -c '1i|# Pending' -c ':put _' -c "3i|$log" -c ':put _' -cx CHANGELOG.md
fi

echo "First 3 lines from changelog:"
echo -e "\n"
head -n 3 CHANGELOG.md
echo -e "\n"

read -p 'Verify change log and press Enter to continue' answer < /dev/tty

git add CHANGELOG.md
git commit -m "Update CHANGELOG.md"

read -p 'Press any button to push changes to upstream' answer < /dev/tty

git push

echo "Deleting remote branch..."
git push origin --delete $branch

echo "Sending slack notification..."
if [ ! -f ".staginglock" ]; then
    author=$(git config --get user.name)
    authorPhrase="\"By: $author\""
    slackjson=$(cat <<EOF
{
	"channel": "GDTR512F2",
	"text": "WebView staging started, all staged PRs will appear in a thread.",
	"attachments": [{
		"color": "good",
		"author_name": $authorPhrase
	}]
}
EOF
)
    # ads-sdk-devs slack channel
    curl -X POST \
        -H 'Content-type: application/json' \
        -H "Authorization: Bearer xoxp-6355312211-143460327904-1105938830800-c62d727b3197062e78ff08fec369fe8b" \
        --data "$slackjson" \
        -o .staginglock \
        https://slack.com/api/chat.postMessage
fi


if [ -f ".staginglock" ]; then
    ts=$(cat .staginglock | jq '.message.ts')
    slackjson=$(cat <<EOF
{
    "channel": "GDTR512F2",
    "text": "<${url}|#${pr}> was merged to master and will be staged",
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
echo "Done."
