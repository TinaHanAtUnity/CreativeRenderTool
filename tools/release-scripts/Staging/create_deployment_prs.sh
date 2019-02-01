#!/usr/bin/env bash
##
# Creates the deployment pull requests.

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/release-scripts/releases.txt"

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

while IFS= read -r release
do
    git checkout "staging/$release"
    hub pull-request -b $release -h "staging/$release" -m "$(pr_message $release)"
done <"$releases"

echo "Deployment PRs made."

author=$(git config --get user.name)
authorPhrase="\"By: $author\""
slackjson=$(cat <<EOF
{
	"text": "Ads SDK Webview has been staged.",
	"attachments": [{
		"title": "See the Latest Changes",
		"title_link": "https://github.com/Applifier/unity-ads-webview/blob/master/CHANGELOG.md",
		"color": "good",
		"author_name": $authorPhrase
	}]
}
EOF
)
curl -X POST -H 'Content-type: application/json' --data $slackjson https://hooks.slack.com/services/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
