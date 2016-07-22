import 'mocha';
import { assert } from 'chai';
import { Platform } from '../../src/ts/Constants/Platform';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import {UnityAdsError} from '../../src/ts/Constants/UnityAdsError';

describe('ClientInfoTest', () => {

    let clientInfo: ClientInfo;

    it('Get ClientInfo DTO', () => {
        // gameId, testMode, applicationName, applicationVersion, sdkVersion, sdkVersionName
        // debuggable, configUrl, webviewUrl, webviewHash, webviewVersion
        let data: any[] = [
            '11111',
            true,
            'com.unity3d.ads.test',
            '1.0.0-test',
            '2000',
            '2.0.0-sdk-test',
            true,
            'http://test.com/config.json',
            'http://test.com/index.html',
            '54321',
            '2.0.0-webview-test',
            null
        ];

        clientInfo = new ClientInfo(Platform.TEST, data);
        console.log(JSON.stringify(clientInfo));

        let dto: any = clientInfo.getDTO();
        console.log(JSON.stringify(dto));

        assert.equal(dto.gameId, '11111');
        assert.equal(dto.testMode, true);
        assert.equal(dto.bundleId, 'com.unity3d.ads.test');
        assert.equal(dto.bundleVersion, '1.0.0-test');
        assert.equal(dto.sdkVersion, '2000');
        assert.equal(dto.sdkVersionName, '2.0.0-sdk-test');
        assert.equal(dto.encrypted, false);
        assert.equal(dto.configUrl, 'http://test.com/config.json');
        assert.equal(dto.webviewUrl, 'http://test.com/index.html');
        assert.equal(dto.webviewHash, '54321');
        assert.equal(dto.webviewVersion, '2.0.0-webview-test');
        assert.equal(dto.platform, 'test');

    });

    it('Construct with invalid gameId', () => {
        let data: any[] = [
            'abc1111',
            true,
            'com.unity3d.ads.test',
            '1.0.0-test',
            '2000',
            '2.0.0-sdk-test',
            true,
            'http://test.com/config.json',
            'http://test.com/index.html',
            '54321',
            '2.0.0-webview-test',
            null
        ];

        // tslint:disable-next-line
        let clientInfoConstructor = () => { new ClientInfo(Platform.TEST, data); };
        assert.throw(clientInfoConstructor, UnityAdsError[UnityAdsError.INVALID_ARGUMENT]);

    });
});
