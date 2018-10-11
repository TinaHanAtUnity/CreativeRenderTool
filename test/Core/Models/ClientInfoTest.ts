import { assert } from 'chai';

import { ClientInfo } from 'Core/Models/ClientInfo';
import 'mocha';
import { ClientInfoData } from '../../../src/ts/Core/Native/Sdk';

describe('ClientInfoTest', () => {

    let clientInfo: ClientInfo;

    it('Get ClientInfo DTO', () => {
        // gameId, testMode, applicationName, applicationVersion, sdkVersion, sdkVersionName
        // debuggable, configUrl, webviewUrl, webviewHash, webviewVersion
        const data: ClientInfoData = [
            '11111',
            true,
            'com.unity3d.ads.test',
            '1.0.0-test',
            2000,
            '2.0.0-sdk-test',
            true,
            'http://test.com/config.json',
            'http://test.com/index.html',
            '54321',
            '2.0.0-webview-test',
            0,
            false
        ];

        clientInfo = new ClientInfo(data);
        const dto: any = clientInfo.getDTO();

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

    });

    it('Construct with invalid gameId', () => {
        const data: ClientInfoData = [
            'abc1111',
            true,
            'com.unity3d.ads.test',
            '1.0.0-test',
            2000,
            '2.0.0-sdk-test',
            true,
            'http://test.com/config.json',
            'http://test.com/index.html',
            '54321',
            '2.0.0-webview-test',
            0,
            false
        ];

        clientInfo = new ClientInfo(data);
        const dto: any = clientInfo.getDTO();

        assert.equal(dto.gameId, 'abc1111');
    });
});
