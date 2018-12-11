import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

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

pipeline {
    agent { label "ads_sdk_docker" }
    stages {
        stage('Check environment') {
            steps {
                script {
                    def commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    echo env.BRANCH_NAME
                    echo env.CHANGE_BRANCH
                }
            }
        }
    }
}
