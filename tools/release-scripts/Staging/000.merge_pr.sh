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

status=$(hub api -XPUT repos/{owner}/{repo}/pulls/$pr/merge \ -f merge_method=squash)

if [ "$status" != *"Pull Request successfully merged" ]; then
    echo "Pull Request #$pr failed to Squash and Merge. Exiting."
    exit
fi

git pull

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

# Allow GitHub enough time to process git push and close PR
echo "Allow enough time for GitHub to process git push and close PR. Wating 5 seconds..."
sleep 5

echo "Deleting remote branch..."
git push origin --delete $branch

echo "Done."
