import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

// TODO: move to sharedLibs
def waitWebviewDeployed(webviewBranch) {
    timeout(15) {
        def CONFIG_URL = "https://config.unityads.unity3d.com/webview/${webviewBranch}/test/config.json"
        echo "Waiting for $CONFIG_URL..."
        waitUntil {
            def status = sh(returnStdout: true, script: "curl -sL -w \"%{http_code}\\n\" \"$CONFIG_URL\" -o /dev/null").trim()
            return status == '200'
        }
    }
}

def main() {
    commitId = sh(returnStdout: true, script: "git log --format=\"%H\" -n 1").trim()
    webviewBranch = env.BRANCH_NAME + '/' + commitId

    //TODO: use if clause below instead before pushing to master
    //if (env.BRANCH_NAME =~ /^PR-/) {
    if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
        stage('Wait for webview deployment') {
            parallel (
                'checkout_helpers': {
                    dir('sharedLibs') {
                        checkout(
                            [$class: 'GitSCM', branches: [[name: 'master']],
                            userRemoteConfigs: [[credentialsId: 'applifier-readonly-jenkins-bot',
                            url: 'https://github.com/Applifier/unity-ads-sdk-tests.git']]]
                        )
                        script {
                            sharedLibs = load 'sharedLibs.groovy'
                        }
                    }
                },

                'wait': {
                    try {
                        waitWebviewDeployed(webviewBranch)
                    } catch (FlowInterruptedException interruptEx) {
                        currentBuild.result = 'ABORTED'
                        echo("Webview '${webviewBranch}' didn\'t get deployed")
                    }
                }
            )
        }

        stage('Run tests') {
            try {
                dir('results') {
                    //TODO: use if clause below instead before pushing to master
                    //if (env.BRANCH_NAME =~ /^staging/) {
                    // run deployment tests
                    if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
                        //TODO: use the line below before pushing to master
                        //def nativeBranch = env.BRANCH_NAME.replace("staging/", "");
                        nativeBranch = "master"
                        parallel (
                            'android-hybrid-tests': {
                                def jobName = 'ads-sdk-hybrid-test-android'
                                def build_ = build(
                                  job: "Applifier/unity-ads-sdk-tests/$jobName",
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ]
                                )

                                def artifactFolder = "$jobName/$build_.number"
                                dir(jobName) {
                                    sharedLibs.downloadFromGcp("$artifactFolder/*")
                                }
                                sharedLibs.removeFromGcp(artifactFolder)
                            },

                            'ios-hybrid-tests': {
                                def jobName = 'ads-sdk-hybrid-test-ios'
                                def build_ = build(
                                  job: "Applifier/unity-ads-sdk-tests/$jobName",
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ],
                                )

                                def artifactFolder = "$jobName/$build_.number"
                                dir(jobName) {
                                    sharedLibs.downloadFromGcp("$artifactFolder/*")
                                }
                                sharedLibs.removeFromGcp(artifactFolder)
                            },

                            //NOTE: system tests results are not being fetched intentionally
                            //since tests on real devices can be flaky and should not
                            //cause any noise on GitHub. Results should instead be checked
                            //manually
                            'android-system-tests': {
                                build(
                                  job: "Applifier/unity-ads-sdk-tests/ads-sdk-systest-android/",
                                  propagate: false,
                                  wait: false,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                                    string(name: 'UNITY_ADS_ANDROID_BRANCH', value: nativeBranch),
                                    //TODO: enable tests before pushing to master
                                    booleanParam(name: 'RUN_TD_TESTS', value: false)
                                  ],
                                )
                            },

                            'ios-system-tests': {
                                build(
                                  job: "Applifier/unity-ads-sdk-tests/ads-sdk-systest-ios/",
                                  propagate: false,
                                  wait: false,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
                                    string(name: 'UNITY_ADS_ANDROID_BRANCH', value: nativeBranch),
                                    //TODO: enable tests before pushing to master
                                    booleanParam(name: 'RUN_TD_TESTS', value: false)
                                  ],
                                )
                            }
                        )

                    // run hybrid tests for all pull requests
                    } else {
                        echo "Tests triggered for PR, branch: ${env.BRANCH_NAME}"
                        parallel (
                            // run hybrid tests for staging branches
                            'android-hybrid-tests': {
                                def jobName = 'ads-sdk-hybrid-test-android'
                                def build_ = build(
                                  job: "Applifier/unity-ads-sdk-tests/$jobName",
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ]
                                )

                                def artifactFolder = "$jobName/$build_.number"
                                dir(jobName) {
                                    sharedLibs.downloadFromGcp("$artifactFolder/*")
                                }
                                sharedLibs.removeFromGcp(artifactFolder)
                            },

                            'ios-hybrid-tests': {
                                def jobName = 'ads-sdk-hybrid-test-ios'
                                def build_ = build(
                                  job: "Applifier/unity-ads-sdk-tests/$jobName",
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ],
                                )

                                def artifactFolder = "$jobName/$build_.number"
                                dir(jobName) {
                                    sharedLibs.downloadFromGcp("$artifactFolder/*")
                                }
                                sharedLibs.removeFromGcp(artifactFolder)
                            }
                        )

                    }
                }
            } finally {
                archiveArtifacts artifacts: "results/**", fingerprint: true
                step ([$class: "JUnitResultArchiver", testResults: "results/**/*.xml"])
            }
        }
    }
}

return this;
