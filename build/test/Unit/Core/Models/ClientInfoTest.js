import { assert } from 'chai';
import { ClientInfo } from 'Core/Models/ClientInfo';
import 'mocha';
describe('ClientInfoTest', () => {
    let clientInfo;
    it('Get ClientInfo DTO', () => {
        // gameId, testMode, applicationName, applicationVersion, sdkVersion, sdkVersionName
        // debuggable, configUrl, webviewUrl, webviewHash, webviewVersion
        const data = [
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
            false,
            false
        ];
        clientInfo = new ClientInfo(data);
        const dto = clientInfo.getDTO();
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
        assert.equal(dto.usePerPlacementLoad, false);
    });
    it('Get ClientInfo DTO using per placement load', () => {
        // gameId, testMode, applicationName, applicationVersion, sdkVersion, sdkVersionName
        // debuggable, configUrl, webviewUrl, webviewHash, webviewVersion
        const data = [
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
            false,
            true
        ];
        clientInfo = new ClientInfo(data);
        const dto = clientInfo.getDTO();
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
        assert.equal(dto.usePerPlacementLoad, true);
    });
    it('Construct with invalid gameId', () => {
        const data = [
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
            false,
            false
        ];
        clientInfo = new ClientInfo(data);
        const dto = clientInfo.getDTO();
        assert.equal(dto.gameId, 'abc1111');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50SW5mb1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9Nb2RlbHMvQ2xpZW50SW5mb1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFcEQsT0FBTyxPQUFPLENBQUM7QUFFZixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBRTVCLElBQUksVUFBc0IsQ0FBQztJQUUzQixFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQzFCLG9GQUFvRjtRQUNwRixpRUFBaUU7UUFDakUsTUFBTSxJQUFJLEdBQW1CO1lBQ3pCLE9BQU87WUFDUCxJQUFJO1lBQ0osc0JBQXNCO1lBQ3RCLFlBQVk7WUFDWixJQUFJO1lBQ0osZ0JBQWdCO1lBQ2hCLElBQUk7WUFDSiw2QkFBNkI7WUFDN0IsNEJBQTRCO1lBQzVCLE9BQU87WUFDUCxvQkFBb0I7WUFDcEIsQ0FBQztZQUNELEtBQUs7WUFDTCxLQUFLO1NBQ1IsQ0FBQztRQUVGLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBUSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFckMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7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