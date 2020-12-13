import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Url } from 'Core/Utilities/Url';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ConfigManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let configPromise;
        let wakeUpManager;
        let metaDataManager;
        let request;
        let configManager;
        let requestGetStub;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            metaDataManager = new MetaDataManager(core);
        });
        describe('with correctly formed configuration json', () => {
            beforeEach(() => {
                const nativeResponse = {
                    url: '',
                    response: JSON.stringify(ConfigurationAuctionPlc),
                    responseCode: 200,
                    headers: []
                };
                configPromise = Promise.resolve(nativeResponse);
                requestGetStub = sinon.stub(request, 'get').returns(configPromise);
            });
            it('calling fetch should return configuration', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                configPromise = configManager.getConfig();
                return configPromise.then((configuration) => {
                    assert.isNotNull(configuration);
                });
            });
            it('add the expected query parameters to the URL', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                configPromise = configManager.getConfig();
                return configPromise.then((configuration) => {
                    assert.isNotNull(configuration);
                    const url = requestGetStub.firstCall.args[0];
                    assert.equal(Url.getQueryParameter(url, 'connectionType'), 'cellular');
                    assert.equal(Url.getQueryParameter(url, 'screenWidth'), '567');
                    assert.equal(Url.getQueryParameter(url, 'screenHeight'), '1234');
                });
            });
        });
        describe('with badly formed configuration json', () => {
            beforeEach(() => {
                const nativeResponse = {
                    url: '',
                    response: '{bad json..',
                    responseCode: 200,
                    headers: []
                };
                configPromise = Promise.resolve(nativeResponse);
                sinon.stub(request, 'get').returns(configPromise);
            });
            it('calling fetch should return error', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
                    assert.fail('should not resolve');
                }).catch((error) => {
                    assert.instanceOf(error, Error);
                });
            });
        });
        describe('with rejected request promise', () => {
            beforeEach(() => {
                const nativeResponse = {
                    url: '',
                    response: '{"error": "Error message from backend"}',
                    responseCode: 405,
                    headers: []
                };
                configPromise = Promise.reject(new RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                sinon.stub(request, 'get').returns(configPromise);
            });
            it('calling fetch should throw ConfigError', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
                    assert.fail('should not resolve');
                }).catch((error) => {
                    assert.instanceOf(error, ConfigError);
                    assert.equal(error.message, 'Error message from backend');
                });
            });
        });
        describe('with rejected request promise, invalid json', () => {
            beforeEach(() => {
                const nativeResponse = {
                    url: '',
                    response: '{error"Error message',
                    responseCode: 405,
                    headers: []
                };
                configPromise = Promise.reject(new RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                sinon.stub(request, 'get').returns(configPromise);
            });
            it('calling fetch should throw ConfigError', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
                    assert.fail('should not resolve');
                }).catch((error) => {
                    assert.instanceOf(error, DiagnosticError);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9NYW5hZ2Vycy9Db25maWdNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBbUIsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTVELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV6QyxPQUFPLHVCQUF1QixNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFFL0IsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLElBQWMsQ0FB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