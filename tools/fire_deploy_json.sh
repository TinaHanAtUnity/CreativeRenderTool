#!/bin/bash

command -v kt >/dev/null 2>&1 || { echo >&2 "kafka-tools (kt) is required to run this script. Install it from https://github.com/fgeller/kt#installation"; exit 1; }

REMOTEURL="kafka1.prd.log.corp.unity3d.com:9092"
TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%S+00:00')
NAME=$(git config --list|grep user.email|cut -d '=' -f 2|cut -d '@' -f 1)

if [ -z "$NAME" ]; then
	echo No git username found, exiting
	exit 1
fi

POSTBODY="{\"value\": $(jq '.|tostring' <<-EOF
{
  "title": "WebView deployment by $NAME",
  "ts": "$TIMESTAMP",
  "user": "$NAME",
  "service": "webview",
  "tags": [
    "deploy",
    "webview",
    "$NAME"
  ]
}
EOF
)}"

echo Firing deployment event to $REMOTEURL
echo $POSTBODY

echo $POSTBODY | kt produce -brokers $REMOTEURL -topic sre-events
