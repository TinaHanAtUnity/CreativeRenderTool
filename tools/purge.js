const fetch = require('node-fetch');
const crypto = require('crypto');
const querystring = require('querystring');

const cdnConfig = {
    'akamai': {
        'base_urls': [
            'cdn-akamai.unityads.unity3d.com',
            'cdn.unityads.unity3d.com',
            'config.unityads.unity3d.com',
            'webview.unityads.unity3d.com'
        ],
        'check_url': 'cdn-akamai.unityads.unity3d.com',
        'username': process.env.AKAMAI_USERNAME,
        'password': process.env.AKAMAI_PASSWORD
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
            'webview.unityads.unity3d.com'
        ],
        'check_url': 'china-cdn2.unityads.unity3d.com',
        'access_key_id': process.env.ALIBABACLOUD_ACCESS_KEY_ID,
        'access_key_secret': process.env.ALIBABACLOUD_ACCESS_KEY_SECRET
    }
};

let branch = process.env.TRAVIS_BRANCH;
if(!branch) {
    throw new Error('Invalid branch: ' + branch);
}

if(branch === 'master') {
    branch = 'development';
}

const commit = process.env.TRAVIS_COMMIT;
if(!commit) {
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
    if(retries >= 0) {
        return doFetch();
    }
    return Promise.reject('Failed to fetch "' + url + '" after retries');
};

const checkConfigJson = (url, version) => {
    console.log('Checking "' + url + '"');
    const doFetch = () => {
        return fetchRetry(url, {}, 5, 5000).then(res => res.json()).then(configJson => {
            if(configJson.version !== version) {
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

    console.log('Starting Akamai purge of: ');
    console.dir(urls);

    let body = {
        'objects': urls,
        'action': 'invalidate'
    };

    const endpoint = 'https://api.ccu.akamai.com/ccu/v2/queues/default';

    return fetchRetry(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(cdnConfig.akamai.username + ':' + cdnConfig.akamai.password).toString('base64')
        },
        body: JSON.stringify(body)
    }, 5, 5000).then(res => {
        if(res.status !== 201) {
            throw new Error('Akamai purge request failed');
        }
        return res.text();
    }).then(body => {
        console.dir(body);
        console.log('Akamai purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.akamai.check_url + urlRoot + path, commit)));
    });
};

let purgeHighwinds = (urlRoot) => {
    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.highwinds.base_urls, path, true);
    }));

    console.log('Starting Highwinds purge of: ');
    console.dir(urls);

    let body = {
        'list': urls.map((url) => {
            return {'url': url};
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
        if(res.status !== 200) {
            throw new Error('Highwinds purge request failed ' + res.status + ': ' + res.text());
        }
        return res.text();
    }).then(body => {
        console.dir(body);
        console.log('Highwinds purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.highwinds.check_url + urlRoot + path, commit)));
    });
};

let purgeChinaNetCenter = (urlRoot) => {
    let urls = flatten(paths.map(path => {
        return urlsFromPath(urlRoot, cdnConfig.chinanetcenter.base_urls, path, false);
    }));

    console.log('Starting ChinaNetCenter purge of: ');
    console.dir(urls);

    const prefix = 'http://wscp.lxdns.com:8080/wsCP/servlet/contReceiver?';
    const combinedUrls = urls.join(';');

    let hash = crypto.createHash('md5');
    hash.update(cdnConfig.chinanetcenter.username + cdnConfig.chinanetcenter.password + combinedUrls);
    let hashedPassword = hash.digest('hex');

    const endpoint = prefix + querystring.stringify({
        username: cdnConfig.chinanetcenter.username,
        passwd: hashedPassword
    }) + '&url=' + combinedUrls;

    return fetchRetry(endpoint, {}, 5, 5000).then(res => {
        if(res.status !== 200) {
            throw new Error('ChinaNetCenter purge request failed');
        }
        return res.text();
    }).then(body => {
        console.dir(body);
        console.log('ChinaNetCenter purge request successful');
        return Promise.all(paths.map(path => checkConfigJson('https://' + cdnConfig.chinanetcenter.check_url + urlRoot + path, commit)));
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
            if(parameters[key]) {
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
            if(res.status !== 200) {
                throw new Error('AliBabaCloud purge request failed');
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

let urlRoot = '/webview/' + branch;
if(branch === '2.0.6') {
    urlRoot = '/webview/master';
}

let purgeList = [
    purgeAkamai(urlRoot),
    purgeHighwinds(urlRoot),
    purgeAliBabaCloud(urlRoot)
];

if(branch === '2.0.6') {
    purgeList.push(purgeAkamai('/webview/2.0.6'));
    purgeList.push(purgeHighwinds('/webview/2.0.6'));
    purgeList.push(purgeAliBabaCloud('/webview/2.0.6'));
}

Promise.all(purgeList).then(() => {
    console.log('Successfully purged all CDNs!');
}).catch(error => {
    console.dir(error);
    process.exit(1);
});
