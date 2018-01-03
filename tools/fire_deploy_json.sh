#!/bin/bash

REMOTEURL="http://es.prd.internal.unity3d.com/events/event"
TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%S+00:00')
NAME=$(git config --list|grep user.email|cut -d '=' -f 2|cut -d '@' -f 1)

if [ -z "$NAME" ]; then
	echo No git username found, exiting
	exit 1
fi

POSTBODY=$(cat <<EOF
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
)

echo Firing deployment event to $REMOTEURL
echo $POSTBODY

curl -H "Content-Type: application/json" -X POST -d "$POSTBODY" "$REMOTEURL"
