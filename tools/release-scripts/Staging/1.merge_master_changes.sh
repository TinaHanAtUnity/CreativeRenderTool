#!/usr/bin/env bash
##
# Merges master into each staging branch.
# Commands can be used here to aid the process of staging

git checkout master
git pull

webviewdir=$(git rev-parse --show-toplevel)
releases="$webviewdir/tools/release-scripts/releases.txt"

RED='\033[31m'
GREEN='\033[32m'
LIGHT_CYAN='\033[1;36m'
RESET='\033[0m'

while IFS= read -r release
do
    git checkout $release < /dev/null
    git checkout staging/$release < /dev/null
    git merge master --no-commit --no-ff < /dev/null
    if [ "$?" -eq "1" ]; then
        # Removes diff from unincluded files from previous staging
        git status | grep 'deleted by us' | sed 's/^.*deleted by us: //g' | xargs git rm < /dev/null
        git status | grep 'added by them' | sed 's/^.*added by them: //g' | xargs git rm < /dev/null
        echo -e "\n${RED}Merge conflicts detected. Fix the conflicts and continue to the next branch.${RESET}"
    else
        echo -e "\n${GREEN}No merge conflicts detected. Confirm that the changes are applied correctly.${RESET}"
    fi

    echo -e "\nStaging for Webview Version: ${GREEN}$release${RESET}\nCurrent Git Status:"
    git status -s

    echo -e "\n${LIGHT_CYAN}Enter Commands now, or enter 'h' for help.\n${RESET}"

    move_to_next_release_branch=false

    while [ "$move_to_next_release_branch" = false ]
    do
        read -p 'Choice:' -n 1 answer < /dev/tty
        echo -e "\n"

        case "$answer" in
            h)
                echo -e "\n\tPress 'c' to automatically commit changes"
                echo -e "\n\tPress 'n' to continue to the next branch"
                ;;

            c)
                git add -A . && git commit -m "Merged master from script after resolving issues"
                ;;
            
            n)
                # Ensures next branch isn't continued to unless all changes have been committed
                if [ $(git status) == *"use"* ]; then
                    echo -e "\n${RED}Staged changes have not been committed. Staying on the current branch.${RESET}"
                else
                    move_to_next_release_branch=true
                fi
                ;;

            *)
                echo "\nUnknown command. Please try again."
                ;;
        esac
    done
done <"$releases"
