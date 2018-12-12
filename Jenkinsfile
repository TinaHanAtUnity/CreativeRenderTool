import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

@NonCPS
def checkIfWebhookTriggered() {
    def causes = currentBuild.rawBuild.getCauses()
    for(cause in causes) {
        if (cause.class.toString().contains("UpstreamCause")) {
            return true
        }
    }
    return false
}

def waitWebviewDeployed(webviewBranch) {
    // TODO: use Travis build status to detect webview deployment status
    timeout(time: 15, unit: 'MINUTES') {
        def CONFIG_URL = "https://config.unityads.unity3d.com/webview/${webviewBranch}/release/config.json"
        echo "Waiting for $CONFIG_URL..."

        waitUntil {
            def status = sh(returnStdout: true, script: "curl -sL -w \"%{http_code}\\n\" \"$CONFIG_URL\" -o /dev/null").trim()
            return status == '200'
        }
    }
}

def runTests = false

pipeline {
    agent { label "ads_sdk_docker" }
    stages {
        stage('Wait for webview deployment') {
            when {
                expression { env.BRANCH_NAME =~ /^PR-/ }
            }

            parallel {
                stage('checkout-helpers') {
                    steps {
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
                    }
                }

                stage('wait-deployment') {
                    steps {
                        script {
                            def commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()

                            if (commitMessage =~ /^Merge branch 'master'/) {
                                webviewBranch = "${env.CHANGE_BRANCH}/${env.GIT_COMMIT}"
                            } else {
                                def commitId = sh(returnStdout: true, script: 'git rev-parse HEAD^1').trim()
                                webviewBranch = "${env.CHANGE_BRANCH}/${commitId}"
                            }

                            try {
                                waitWebviewDeployed(webviewBranch)
                                runTests = true
                            } catch (FlowInterruptedException interruptEx) {
                                currentBuild.result = 'ABORTED'
                                error("\n\nWARNING! Webview branch '${webviewBranch}' deployment seems to have not succeeded! Not running tests.\n\n")
                            }
                        }
                    }
                }
            }
        }

        stage('Run tests') {
            when {
                expression { return runTests }
            }

            steps {
                script {
                    hybridTestBuilders = [:]

                    ['hybrid-test-android','hybrid-test-ios'].each {
                        stage -> hybridTestBuilders[stage] = {
                            def jobName = "ads-sdk-$stage"
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
                        }
                    }

                    systemTestBuilders = [:]
                    def nativeBranch = env.CHANGE_BRANCH.replace("staging/", "");

                    ['systest-android','systest-ios'].each {
                        stage -> systemTestBuilders[stage] = {
                            def jobName = "ads-sdk-$stage"
                            build(
                              job: "Applifier/unity-ads-sdk-tests/$jobName",
                              propagate: false,
                              wait: false,
                              parameters: [
                                string(name: 'WEBVIEW_BRANCH', value: env.CHANGE_BRANCH),
                                string(name: 'UNITY_ADS_ANDROID_BRANCH', value: nativeBranch),
                                string(name: 'UNITY_ADS_IOS_BRANCH', value: nativeBranch)
                              ],
                            )
                        }
                    }
                }

                dir('results') {
                    script {
                        def isWebhookTriggered = checkIfWebhookTriggered()

                        // run all tests unless the job is manually triggered(restarted)
                        if (env.CHANGE_BRANCH =~ /^staging/ && isWebhookTriggered) {
                            parallel (hybridTestBuilders + systemTestBuilders)

                        } else { // run only hybrid tests
                            parallel hybridTestBuilders
                        }
                    }
                }

                archiveArtifacts artifacts: "results/**", fingerprint: true
                step ([$class: "JUnitResultArchiver", testResults: "results/**/*.xml"])
                script {
                    slackChannel = "ads-sdk-notify"
                    sharedLibs.sendTestSummary(slackChannel)
                }
            }
        }
    }
}
