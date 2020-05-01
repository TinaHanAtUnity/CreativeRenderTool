#!/usr/bin/env bash
##
# Simply notifies that the deployment finished and is being monitored

# update change log

git checkout master
git pull

read -r firstline<CHANGELOG.md

if [ "$firstline" == "# Pending" ]; then
    deployment=$(date -u)
    ex -s -c "1d" -c "1i|# $deployment" -cx CHANGELOG.md

    echo "First line from changelog:"
    echo -e "\n"
    head -n 1 CHANGELOG.md
    echo -e "\n"

    read -p 'Press any button to push changes to upstream' answer < /dev/tty

    git add CHANGELOG.md
    git commit -m "Update CHANGELOG.md"
    git push
fi

# ads-sdk-devs slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has completed. :smile:","color":"good"}]}' https://hooks.slack.com/services/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

# ads-deploys slack channel
curl -X POST -H 'Content-type: application/json' --data '{"attachments":[{"text":"Ads SDK Deployment has completed. :smile:","color":"good"}]}' https://hooks.slack.com/services/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

echo "Notified completion of the deployments"
