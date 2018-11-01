import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

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

def downloadArtifacts(job) {
    try {
        withCredentials([file(credentialsId: 'ADS_SDK_ARTIFACT_BUCKET_KEY', variable: 'BUCKET_KEY')])
        {
            sh """#!/bin/bash
            if [ ! -e ${HOME}/google-cloud-sdk/.installed.dummy ]; then
              rm -rf ${HOME}/google-cloud-sdk;
              curl https://sdk.cloud.google.com | bash > /dev/null;
              touch ${HOME}/google-cloud-sdk/.installed.dummy;
            fi
            echo 'source $HOME/google-cloud-sdk/path.bash.inc' > ~/.bashrc
            source ~/google-cloud-sdk/path.bash.inc
            gcloud auth activate-service-account --key-file $BUCKET_KEY

            gsutil cp -r gs://unity-ads-jenkins-artifacts/$job ./results/
            gsutil rm -r gs://unity-ads-jenkins-artifacts/$path
            """
        }
    } catch (e) {
        echo "Failed to download artifacts from $job due to error: $e"
    }
}

def main() {
    commitId = sh(returnStdout: true, script: "git log --format=\"%H\" -n 1").trim()
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
            if (webviewDeployed) {
                dir('results') {
                    //TODO: use if clause below instead before pushing to master
                    //if (env.BRANCH_NAME =~ /^staging/) {
                    if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
                        parallel (
                            // run hybrid tests for staging branches
                            'Android hybrid tests': {
                                def _jobName = 'ads-sdk-hybrid-test-android'
                                def _build = build(
                                  job: _jobName,
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ]
                                )

                                def artifactFolder = "$_jobName-$_build.number"

                                downloadArtifacts(artifactFolder)
                            },

                            'iOS hybrid tests': {
                                def _jobName = 'ads-sdk-hybrid-test-ios'
                                def _build = build(
                                  job: _jobName,
                                  propagate: false,
                                  wait: true,
                                  parameters: [
                                    string(name: 'WEBVIEW_BRANCH', value: webviewBranch),
                                  ],
                                )

                                def artifactFolder = "$_jobName-$_build.number"

                                downloadArtifacts(artifactFolder)
                            },
                            // run deployment tests for staging branches
                            // TODO: add iOS system tests
                            'System tests': {
                                //TODO: uncomment the line below before pushing to master
                                //def nativeBranch = env.BRANCH_NAME.replace("staging/", "");
                                def nativeBranch = "master"
                                build(
                                  job: "Applifier/unity-ads-sdk-tests/ads-sdk-systest-android/",
                                  propagate: false,
                                  wait: true,
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
                        //           wait: true,
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
                        //           wait: true,
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

        post {
            always {
                archiveArtifacts artifacts: "results/**", fingerprint: true
                step ([$class: "JUnitResultArchiver", testResults: "results/**/*.xml"])
            }
        }
    }
}

return this;
