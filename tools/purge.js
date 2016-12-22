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
    'chinanetcenter': {
        'base_urls': [
            'china-cdn.unityads.unity3d.com',
            'cdn.unityads.unity3d.com',
            'geocdn.unityads.unity3d.com',
            'config.unityads.unity3d.com',
            'webview.unityads.unity3d.com'
        ],
        'check_url': 'china-cdn.unityads.unity3d.com',
        'username': process.env.CHINANETCENTER_USERNAME,
        'password': process.env.CHINANETCENTER_PASSWORD
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

const checkConfigJson = (url, version) => {
    console.log('Checking "' + url + '"');
    let doFetch = () => {
        return fetch(url).then(res => res.json()).then(configJson => {
            if(configJson.version !== version) {
                console.log('Invalid version "' + configJson.version + '" from "' + url + '"');
                let timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        doFetch().then(() => resolve());
                    }, 5000);
                });
                return timeoutPromise;
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

    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(cdnConfig.akamai.username + ':' + cdnConfig.akamai.password).toString('base64')
        },
        body: JSON.stringify(body)
    }).then(res => {
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

    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cdnConfig.highwinds.bearer
        },
        body: JSON.stringify(body)
    }).then(res => {
        if(res.status !== 200) {
            throw new Error('Highwinds purge request failed');
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

    return fetch(endpoint).then(res => {
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

let urlRoot = '/webview/' + branch;
Promise.all([
    purgeAkamai(urlRoot),
    purgeHighwinds(urlRoot),
    purgeChinaNetCenter(urlRoot)
]).then(() => {
    console.log('Successfully purged all CDNs!');
    if(branch === '2.0.6-ios') {
        urlRoot = '/webview/master';
        return Promise.all([
            purgeAkamai(urlRoot),
            purgeHighwinds(urlRoot),
            purgeChinaNetCenter(urlRoot)
        ]);
    }
});
