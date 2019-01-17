#!/usr/bin/env bash
##
# Simply notifies that the deployment finished and is being monitored

# ads-sdk slack channel
curl -X POST -H 'Content-type: application/json' --data '{"text":"Ads SDK Webview Deployment has finished and is being closely monitored. :smile:"}' https://hooks.slack.com/services/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
# ads-deploys slack channel
curl -X POST -H 'Content-type: application/json' --data '{"text":"Ads SDK Webview Deployment has finished and is being closely monitored. :smile:"}' https://hooks.slack.com/services/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
