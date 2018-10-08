def main() {
    if (env.BRANCH_NAME =~ /^PR-/) {
        stage('Run tests') {
            if (env.BRANCH_NAME =~ /^staging/) {
                parallel (
                    // run hybrid tests for staging branches
                    'Hybrid tests': {
                        // build(
                        //   job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-android/",
                        //   propagate: true,
                        //   parameters: [
                        //     string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                        //   ],
                        // )
                        echo "This is a placeholder for running hybrid tests for webview staging branch: ${env.BRANCH_NAME}"
                    },
                    // run deployment tests for staging branches
                    'System tests': {
                        // build(
                        //   job: "Applifier/unity-ads-sdk-tests/ads-sdk-systest-android/",
                        //   propagate: true,
                        //   parameters: [
                        //     string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                        //   ],
                        // )
                        echo "This is a placeholder for running system (deployment) tests for webview staging branch:  ${env.BRANCH_NAME}"
                    }
                )
            } else {
                // run hybrid tests for all pull requests
                stage('Hybrid tests') {
                    // build(
                    //   job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-android/",
                    //   propagate: true,
                    //   parameters: [
                    //     string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                    //   ],
                    // )
                    echo "This is a placeholder for running hybrid tests on PR, branch: ${env.BRANCH_NAME}"
                }
            }
        }
    }
}

return this;
