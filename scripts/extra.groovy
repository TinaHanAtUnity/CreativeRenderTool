import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

def waitWebviewDeployed(webviewBranch) {
    timeout(10) {
        def CONFIG_URL = "https://config.unityads.unity3d.com/webview/${webviewBranch}/test/config.json"
        echo "Waiting for $CONFIG_URL..."
        waitUntil {
            def status = sh(returnStdout: true, script: "curl -sL -w \"%{http_code}\\n\" \"$CONFIG_URL\" -o /dev/null").trim()
            return status == '200'
        }
    }
}

def main() {
    commitId = sh(returnStdout: true, script: "git log --format=\"%H\" -n 1")
    def webviewBranch = env.BRANCH_NAME + '/' + commitId
    def webviewDeployed = false
    //if (env.BRANCH_NAME =~ /^PR-/) {
    if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
        stage('Wait for webview deployment') {
            try {
                waitWebviewDeployed(webviewBranch)
                webviewDeployed = true
            } catch (FlowInterruptedException interruptEx) {
                currentBuild.result = 'ABORTED'
                echo("Webview '${webviewBranch}' didn\'t get deployed")
            }
        }

        stage('Run tests') {
            when {
                expression { return webviewDeployed }
            }
            //TODO: use if clause below instead before pushing to master
            //if (env.BRANCH_NAME =~ /^staging/) {
            if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
                parallel (
                    // run hybrid tests for staging branches
                    'Android hybrid tests': {
                        build(
                          job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-android/",
                          propagate: true,
                          parameters: [
                            string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                          ]
                        )
                    },

                    'iOS hybrid tests': {
                        build(
                          job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-ios/",
                          propagate: true,
                          parameters: [
                            string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                          ],
                        )
                    },
                    // run deployment tests for staging branches
                    // TODO: add iOS system tests
                    'System tests': {
                        //TODO: uncomment the line below before pushing to master
                        //def nativeBranch = env.BRANCH_NAME.replace("staging/", "");
                        def nativeBranch = "master"
                        build(
                          job: "Applifier/unity-ads-sdk-tests/ads-sdk-systest-android/",
                          propagate: true,
                          parameters: [
                            string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                            string(name: 'UNITY_ADS_ANDROID_BRANCH', value: nativeBranch),
                            booleanParam(name: 'RUN_TD_TESTS', value: false)
                          ],
                        )
                    }
                )
            } else {
                // run hybrid tests for all pull requests
                echo "This is a placeholder for running hybrid tests on PR, branch: ${env.BRANCH_NAME}"
                // parallel (
                //     // run hybrid tests for staging branches
                //     'Android hybrid tests': {
                //         build(
                //           job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-android/",
                //           propagate: true,
                //           parameters: [
                //             string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                //           ]
                //         )
                //     },
                //
                //     'iOS hybrid tests': {
                //         build(
                //           job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-ios/",
                //           propagate: true,
                //           parameters: [
                //             string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                //           ],
                //         )
                //     }
                // )
            }
        }
    }
}

return this;
