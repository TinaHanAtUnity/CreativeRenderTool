#!/usr/bin/env bash
##
# Simply notifies that the deployment finished and is being monitored

# ads-sdk-devs slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has completed. :smile:","color":"good"}]}' https://hooks.slack.com/services/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

# ads-deploys slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has completed. :smile:","color":"good"}]}' https://hooks.slack.com/services/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
