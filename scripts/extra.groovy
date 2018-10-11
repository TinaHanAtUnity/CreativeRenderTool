def main() {
    //TODO: use if clause below instead before pushing to master
    //if (env.BRANCH_NAME =~ /^PR-/) {
    if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
        stage('Run tests') {
            //TODO: use if clause below instead before pushing to master
            //if (env.BRANCH_NAME =~ /^staging/) {
            if (env.BRANCH_NAME =~ /feature\/jenkinsfile/) {
                parallel (
                    // run hybrid tests for staging branches
                    // TODO: add tests for iOS
                    'Hybrid tests': {
                        build(
                          job: "Applifier/unity-ads-sdk-tests/ads-sdk-hybrid-test-android/",
                          propagate: true,
                          parameters: [
                            string(name: 'WEBVIEW_BRANCH', value: env.BRANCH_NAME),
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
                            string(name: 'UNITY_ADS_ANDROID_BRANCH', value: nativeBranch)
                          ],
                        )
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
