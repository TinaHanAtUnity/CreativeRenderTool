# Webview Deployment Scripts

This is a collection of scripts to help stage a deployment of the webview.

## Process Overview

In order to streamline PRs merging into each respective release branch, it is important for us to progressively merge PRs merged to master into staging branches. This will allow less complication during staging.

The responsibility of merging the PR to each of the release branches belongs to all devlopers of the Ads SDK.

Once a suitable collection of PRs have been added to the staging branches, then deployment PRs will be created. At this time, all new PRs that wish to be merged should wait for the deployment to finish.

A few hours after the PRs are created, the automated tests should finish, and be manually verified for correctness. If everything is deemed suitable, then the deployment shall commence with each of the staging branches being merged into the release branches.

The builds are then monitored until completion, and the diagnostic graphs are checked for webview adoption, error rate fluctuations, and spend decreases.

If everything looks to be in order, the ads-deploys and ads-sdk channels are notified of a successful deployment, and then the new staging branches are created from the release branches to start the cycle once more.

## Utilizing the Scripts

The scripts can either be ran individually, or through the use of make steps. The make steps run one or more scripts, and explanations of what each make step and individual script do can be found below.

### `make staging`

#### Staging/create_staging_branches.sh

Run this script if staging branches do not yet exist.

#### Staging/merge_master_changes.sh

This should be ran after a PR is merged to the master branch. Have two tabs of terminal opened. Run the script in one of the terminals. In a normal case, there will be merge conflicts to be solved.

In the second terminal, fix the merge conflicts appropriately:

`git status`

Fix the issues, save, and ensure that the linter and the unit test pass with:

`make clean lint test-unit`

Commit the results once the conflicts are solved with:

`git add -A . && git commit -m "Merge master conflicts"`

Go back to the original tab and hit enter to continue to the next branch, and repeat.

Once the changes have been made, update the CHANGELOG.md in the master webview branch with the PR title and link. Follow the examples shown in the changelog. If there isn't a "# Pending" tag at the top, then go ahead and add it above your PR title.

#### Staging/push_staging_changes.sh

After finishing execution of the first script, run this script to push up all of the branches. This is separated out into its own script in case there are any issues during merging master changes into the branches, and the merger wishes to stop merging.

### `make prs`

#### Staging/create_deployment_prs.sh

This script should be ran once a suitable amount of PRs have been merged. Suitable is hard term to define, but just ensure that critical code changes are deployed by themselves.

This will create the deployment PRs in the Webview branch, notify the ads-sdk channel that a deployment has been staged, and open the Webview PRs so that the user can see that the PRs were created successfully.

### `make deploy`

#### Deployment/update_lkgs.sh

Run this script once ~3 or more hours have passed since the deployment PRs have been made. The script will start by opening the results of the staging tests for both Android and iOS. The user will then check through the results of the tests by looking at the screenshots for a selection of the branches.

From time to time, these tests will fail. Just ensure that the same branch failing on one platform is not failing on the other. Also, check in the top right of a branch's test to see how long it was running for. If it was under ten minutes, then the test just failed.

If the results are positive, then update the changelog in the master webview branch with the time of deployment by using:

`date -u`

in the terminal, and replace the "Pending" tag with the output. Then, the user should prompt the script with a y/Y, and the LKG (Last Known Goods) tags will be updated to the current release. This is done so that the user can revert to these LKGs if there are issues during deployment.

This script will then run the fire_deploy_json.sh and notify the ads-sdk and ads-deploys of the incoming deployment. Make sure to look in those respective channels to see if anyone is deploying, and wait for them to finish before running the next script.

#### Deployment/merge_deployment_prs.sh

This script will automatically merge the deployment PRs and delete the branches. It is not recommended to run this unless the user also created the deployment PRs. It is currently unclear why this occurs, but this will be updated when the resolution is found.

If you did not create the PRs, just manually merge and delete the deployment PR branches.

After successfully merging and deleting all of the PRs, the script will open Grafana, Kibana, and Travis CI for monitoring purposes.

The current goal would be to ensure that all of the Travis builds pass, all of the Grafana graphs don't suddenly drop, and that a random influx of unexpected errors are spawned on Kibana. Note that these changes should only be taken into account once the new webview versions are being adopted.

When you are monitoring, be sure to look at the rightmost pie chart in kibana. The outer rings will show the user when the new webview versions are starting to be adopted. If you hover your mouse over one of the outer slices, you will see that a certain Webview hash currently has a certain percentage of players using it. The outer slice will start to be horizontally consumed by another color, which will be the new webview verison. Seeing this indicates that the new webviews are being adopted, and any random changes occurring in our diagnostics are due to the newly deployed changes.

If things aren't looking correct, then run the revert script.

### `make notify`

#### Deployment/notify_deployment_finished.sh

Once all of the builds have finished in Travis, Webview adoption is occurring, and nothing is seemingly broken, run this script. All it will do is notify ads-sdk and ads-deploys that the Webview deployment is finished and being monitored. If anything is broken, it should almost immediately show in the diagnostics, so once adoption occurs in all branches, then the deployment should end successfully.

### `make revert`

#### revert_to_lkgs.sh

Ideally, this script won't be ran, but sometimes incorrect changes slip through the cracks. It's not uncommon and don't feel bad about it. Make sure that the bad diagnostics are definiely coming from the new Webview, run this script, and then devise a plan to fix those changes. The ads-sdk channel will be notified that the deployment was reverted.
