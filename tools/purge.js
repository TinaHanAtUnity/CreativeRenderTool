/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require('node-fetch');
const crypto = require('crypto');
const querystring = require('querystring');
const childProcess = require('child_process');
const versionMap = require('./webview.version.map.json');

const cdnConfig = {
    'akamai': {
        'base_urls': [
            'cdn-akamai.unityads.unity3d.com',
            'cdn.unityads.unity3d.com',
            'config.unityads.unity3d.com',
            'webview.unityads.unity3d.com',
            'config-cn.unityads.unity3d.com'
        ],
        'host': process.env.AKAMAI_HOST,
        'access_token': process.env.AKAMAI_ACCESS_TOKEN,
        'client_secret': process.env.AKAMAI_CLIENT_SECRET,
        'client_token': process.env.AKAMAI_CLIENT_TOKEN
    },
    'highwinds': {
        'base_urls': [
            'cdn-highwinds.unityads.unity3d.com',
            'cdn.unityads.unity3d.com',
            'geocdn.unityads.unity3d.com',
            'config.unityads.unity3d.com',
            'webview.unityads.unity3d.com'
        ],
        'check_url': 'cdn-highwinds.unityads.unity3d.com',
        'bearer': process.env.HIGHWINDS_BEARER,
        'account_hash': process.env.HIGHWINDS_ACCOUNT_HASH
    },
    'alibabacloud': {
        'base_urls': [
            'china-cdn2.unityads.unity3d.com',
            'cdn.unityads.unity3d.com',
            'geocdn.unityads.unity3d.com',
            'config.unityads.unity3d.com',
            'webview.unityads.unity3d.com',
            'config.unityads.unitychina.cn',
            'webview.unityads.unitychina.cn'
        ],
        'check_url': 'china-cdn2.unityads.unity3d.com',
        'access_key_id': process.env.ALIBABACLOUD_ACCESS_KEY_ID,
        'access_key_secret': process.env.ALIBABACLOUD_ACCESS_KEY_SECRET
    },
    'tencentcloud': {
        'base_urls': [
            'china-cdn3.unityads.unitychina.cn',
            'config.unityads.unitychina.cn',
            'webview.unityads.unitychina.cn'
        ],
        'check_url': 'china-cdn3.unityads.unitychina.cn',
        'secret_id': process.env.TENCENT_SECRET_ID,
        'secret_key': process.env.TENCENT_SECRET_KEY
    }
};

let branch = process.env.TRAVIS_BRANCH;
if (!branch) {
    throw new Error('Invalid branch: ' + branch);
}

if (versionMap[branch]) {
    branch = versionMap[branch][0];
}

const commit = process.env.TRAVIS_COMMIT;
if (!commit) {
    throw new Error('Invalid commit: ' + commit);
}

const paths = [
    '/release/config.json',
    '/test/config.json'
];

const urlsFromPath = (urlRoot, baseUrls, path, addHttps) => {
    return baseUrls.map((baseUrl) => {
        return (addHttps ? 'https://' : '') + baseUrl + urlRoot + path;
    });
};

const flatten = (array) => {
    return array.reduce((flatArray, array) => {
        return flatArray.concat(Array.isArray(array) ? flatten(array) : array);
    }, []);
};

const fetchRetry = (url, options, retries, delay) => {
    const doFetch = () => {
        return fetch(url, options ? options : {}).catch(error => {
            console.dir(error);
            console.log('Retrying in ' + delay + 'ms');
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetchRetry(url, options, --retries, delay)
                        .then((response) => resolve(response))
                        .catch((error) => reject(error));
                }, delay);
            });
        });
    };
    if (retries >= 0) {
        return doFetch();
    }
    return Promise.reject('Failed to fetch "' + url + '" after retries');
};

const checkConfigJson = (url, version) => {
    console.log('Checking "' + url + '"');
    const doFetch = () => {
        return fetchRetry(url, {}, 5, 5000).then(res => res.json()).then(configJson => {
            if (configJson.version !== version) {
                console.log('Invalid version "' + configJson.version + '" from "' + url + '"');
                return new Promise((resolve) => {
                    setTimeout(() => {
                        doFetch().then(() => resolve());
                    }, 5000);
                });
            }
        });
    };
    return doFetch();
};

let purgeAkamai = (urlRoot) => {
    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.akamai.base_urls, path, true);
    }));

    const executeShell = (command) => {
        childProcess.execSync(command, (err, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (stdout.indexOf('[OK]') === -1 || stderr.indexOf('API Error') > -1) {
                throw new Error(`Akamai purge request failed`);
            }
        });
    };

    console.log('Starting Akamai purge of: ');
    console.dir(urls);
    const edgerc = `[ccu]\nhost = ${cdnConfig.akamai.host}\nclient_token = ${cdnConfig.akamai.client_token}\nclient_secret = ${cdnConfig.akamai.client_secret}=\naccess_token = ${cdnConfig.akamai.access_token}`;
    const createEdgercFile = `echo $'${edgerc}' > $(pwd)/.edgerc`;
    const purgeAkamai = `akamai purge --edgerc $(pwd)/.edgerc invalidate ${urls.join(' ')}`;
    executeShell(`${createEdgercFile} && ${purgeAkamai}`);
};

let purgeHighwinds = (urlRoot) => {
    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.highwinds.base_urls, path, true);
    }));

    console.log('Starting Highwinds purge of: ');
    console.dir(urls);

    let body = {
        'list': urls.map((url) => {
            return { 'url': url };
        })
    };

    const endpoint = 'https://striketracker.highwinds.com/api/v1/accounts/' + cdnConfig.highwinds.account_hash + '/purge';

    return fetchRetry(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cdnConfig.highwinds.bearer
        },
        body: JSON.stringify(body)
    }, 5, 5000).then(res => {
        if (res.status !== 200) {
            console.log('Highwinds purge request failed, HTTP ' + res.status);
            return res.text().then(body => {
                console.dir(body);
                throw new Error('Highwinds purge request failed ' + res.status + ': ' + body);
            });
        }
        return res.text();
    }).then(body => {
        console.dir(body);
        console.log('Highwinds purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.highwinds.check_url + urlRoot + path, commit)));
    });
};

let purgeAliBabaCloud = (urlRoot) => {
    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.alibabacloud.base_urls, path, false);
    }));

    console.log('Starting AliBabaCloud purge of: ');
    console.dir(urls);

    const secret = cdnConfig.alibabacloud.access_key_secret;

    const getParameters = (path) => {
        return {
            Format: 'JSON',
            Version: '2014-11-11',
            AccessKeyId: cdnConfig.alibabacloud.access_key_id,
            SignatureMethod: 'HMAC-SHA1',
            Timestamp: encodeURIComponent((new Date()).toISOString().slice(0, -5) + 'Z'),
            SignatureVersion: '1.0',
            SignatureNonce: Math.random() * Math.pow(10, 18),
            Action: 'RefreshObjectCaches',
            ObjectPath: encodeURIComponent(path)
        };
    };

    const getCanonicalized = (parameters) => {
        let canonicalized = [];
        Object.keys(parameters).sort().forEach((key) => {
            if (parameters[key]) {
                canonicalized.push(encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]));
            }
        });
        return canonicalized.join('%26');
    };

    const getStringToSign = (value) => {
        return 'GET&%2F&' + value.replace(/=/g, '%3D');
    };

    const getSignedString = (value) => {
        const hmac = crypto.createHmac('sha1', secret + '&');
        hmac.update(value);
        return hmac.digest('base64');
    };

    const getUrls = (urls) => {
        return urls.map(url => {
            const parameters = getParameters(url);
            const signature = getSignedString(getStringToSign(getCanonicalized(parameters)));
            parameters.Signature = encodeURIComponent(signature);
            return 'https://cdn.aliyuncs.com/?' + Object.entries(parameters).map(([key, value]) => {
                return key + '=' + value;
            }).join('&');
        });
    };

    return Promise.all(getUrls(urls).map((url) => {
        return fetchRetry(url, {}, 5, 5000).then(res => {
            if (res.status !== 200) {
                throw new Error(`AliBabaCloud purge request failed with HTTP code: ${res.status}`);
            }
            return res.text();
        }).then(body => {
            console.dir(body);
        });
    })).then(() => {
        console.log('AliBabaCloud purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.alibabacloud.check_url + urlRoot + path, commit)));
    });
};

let purgeTencent = (urlRoot) => {

    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.tencentcloud.base_urls, path, true);
    }));

    console.log('Starting Tencent purge of: ');
    console.dir(urls);

    let paramObject = {
        Action: 'PurgeUrlsCache',
        Nonce: Math.random() * Math.pow(10, 18),
        Region: '',
        SecretId: cdnConfig.tencentcloud.secret_id,
        Timestamp: Math.floor(new Date().getTime() /1000),
        Token: '',
        Version: '2018-06-06'
    };

    const setupUrls = (urls, paramObject) => {
        urls.map((url, index) => {
            paramObject['Urls.' + index] = url;
        });
    };

    const getCanonicalized = (params, urlEncodeValue) => {
        const canonicalized = Object.entries(params).sort().map(([key, value]) => {
            const val = urlEncodeValue ? encodeURIComponent(value) : value;
            return key + '=' + val;
        }).join('&');
        return canonicalized;
    };

    const getStringToSign = (params) => {
        const signatureSrc = 'GETcdn.tencentcloudapi.com/?' + getCanonicalized(params, false);
        return signatureSrc;
    };

    const getSignedString = (signatureSrc, secretKey) => {
        const signature = crypto.createHmac('sha1', secretKey).update(signatureSrc).digest('base64');
        return signature;
    };

    const getRequestUrl = () => {

        setupUrls(urls, paramObject);
        const signSrc = getStringToSign(paramObject);
        const signature = getSignedString(signSrc, cdnConfig.tencentcloud.secret_key);

        paramObject['Signature'] = signature;
        const urlCandidate = getCanonicalized(paramObject, true);
        const signedUrl = 'https://cdn.tencentcloudapi.com/?' + urlCandidate;
        return signedUrl;
    };

    return fetchRetry(getRequestUrl(), {}, 5, 5000).then(res => {
        if (res.status !== 200) {
            throw new Error(`Tencent CDN purge request failed with HTTP code: ${res.status}`);
        }
        return res.text();
    }).then(body => {
        console.dir(body);
        console.log('Tencent CDN purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.tencentcloud.check_url + urlRoot + path, commit)));
    });
};

let branchList = [];

if (versionMap[branch]) {
    versionMap[branch].forEach((version) => branchList.push(version));
} else {
    branchList.push(branch);
}

let purgeList = [];

branchList.forEach((branch) => {
    purgeList.push([
        purgeAkamai('/webview/' + branch),
        purgeHighwinds('/webview/' + branch),
        purgeAliBabaCloud('/webview/' + branch),
        purgeTencent('/webview/' + branch)
    ]);
});

Promise.all(purgeList).then(() => {
    console.log('Successfully purged all CDNs!');
}).catch(error => {
    console.dir(error);
    process.exit(1);
});
