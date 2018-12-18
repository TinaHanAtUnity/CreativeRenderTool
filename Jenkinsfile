@NonCPS
def checkIfJobReplayed() {
    def causes = currentBuild.rawBuild.getCauses()
    for(cause in causes) {
        if (cause.class.toString().contains("ReplayCause")) {
            return true
        }
    }
    return false
}

def setupTools() {
    // Job can possibly run on OSX or Linux box
    sh """
      which jq ||
      unameOutput="\$(uname -s)" &&
      case "\${unameOutput}" in
      Linux*)   apt-get -y update || true
                apt-get -y install jq
                ;;
      Darwin*)  if [ -z "\$(which jq)" ]; then
                  brew install jq
                fi
                ;;
      esac
    """
}

def waitWebviewDeployed(webviewBranch) {
    setupTools()

    def webviewBranchEscaped = webviewBranch.replace("/", "%2F")

    withCredentials([string(credentialsId: 'ADS_SDK_TRAVIS_API_TOKEN', variable: 'TRAVIS_TOKEN')]) {
        def buildId = sh(
          returnStdout: true,
          script: """
            curl -X GET \
            -H \"Content-Type: application/json\" \
            -H \"Travis-API-Version: 3\" \
            -H \"Accept: application/json\" \
            -H \"Authorization: token $TRAVIS_TOKEN\" \
            'https://api.travis-ci.com/repo/Applifier%2Funity-ads-webview/branch/$webviewBranchEscaped' \
            | jq -r '.last_build.id'
          """
        ).trim()

        while (true) {
            buildStatus = sh(
              returnStdout: true,
              script: """
                curl -X GET \
                -H \"Content-Type: application/json\" \
                -H \"Travis-API-Version: 3\" \
                -H \"Accept: application/json\" \
                -H \"Authorization: token $TRAVIS_TOKEN\" \
                'https://api.travis-ci.com/build/$buildId' \
                | jq -r '.state'
              """
            ).trim()

            if (buildStatus != "created" || buildStatus != "received" || buildStatus != "started") {
               break
            }

            sleep 10
        }
    }

    return buildStatus == "passed"
}

def runTests = false

pipeline {
    agent { label "ads_sdk_worker" }
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
                            def gitRepoUrl = sh(returnStdout: true, script: 'git config --get remote.origin.url').trim()

                            withCredentials([string(credentialsId: 'github_ro_token', variable: 'GITHUB_TOKEN')]) {
                                commitId = sh(
                                  returnStdout: true,
                                  script: """curl -v -H \"Authorization: token ${GITHUB_TOKEN}\" \
                                    -H \"Accept:application/vnd.github.VERSION.sha\" \
                                    https://api.github.com/repos/Applifier/unity-ads-webview/commits/refs/pull/${CHANGE_ID}/head"""
                                ).trim()
                            }
                            webviewBranch = "${env.CHANGE_BRANCH}/${commitId}"

                            def webviewDeployed = waitWebviewDeployed(env.CHANGE_BRANCH)

                            if (webviewDeployed) {
                                runTests = true
                            } else {
                                currentBuild.result = 'ABORTED'
                                error("\n\nWebview branch '${webviewBranch}' deployment seems to have not succeeded! Not running tests.\n\n")
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

                            try {
                                sharedLibs.removeFromGcp(artifactFolder)
                            } catch(e) {
                                echo "Could not clean up artifacts from GCP: '$e'"
                            }
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
                        def isJobReplayed = checkIfJobReplayed()
                        echo "Is job replayed: '$isJobReplayed'"

                        // run all tests unless the job is manually triggered(restarted)
                        if (env.CHANGE_BRANCH =~ /^staging/ && !isJobReplayed) {
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
