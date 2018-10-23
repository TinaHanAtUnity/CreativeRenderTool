import * as sinon from 'sinon';
import { assert } from 'chai';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { PurchasingFailureReason } from 'Promo/Models/PurchasingFailureReason';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PromoEventsTest', () => {

    let promoEvents: PromoEvents;
    let deviceInfo: IosDeviceInfo;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let analyticsStorage: AnalyticsStorage;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let clientInfo: ClientInfo;

    beforeEach(() => {
        coreConfig = sinon.createStubInstance(CoreConfiguration);
        (<sinon.SinonStub>coreConfig.getUnityProjectId).returns('unit-test');
        (<sinon.SinonStub>coreConfig.getToken).returns('unit-test-gamer-token');

        adsConfig = sinon.createStubInstance(AdsConfiguration);
        (<sinon.SinonStub>adsConfig.isOptOutEnabled).returns(true);
        (<sinon.SinonStub>adsConfig.isGDPREnabled).returns(true);

        platform = Platform.IOS;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

        clientInfo = sinon.createStubInstance(ClientInfo);
        (<sinon.SinonStub>clientInfo.getGameId).returns('fake-game-id');
        (<sinon.SinonStub>clientInfo.getSdkVersionName).returns('3.0.0');
        (<sinon.SinonStub>clientInfo.getApplicationVersion).returns('1.0');

        deviceInfo = sinon.createStubInstance(IosDeviceInfo);
        (<sinon.SinonStub>deviceInfo.getScreenWidth).resolves(2000);
        (<sinon.SinonStub>deviceInfo.getScreenHeight).resolves(2000);
        (<sinon.SinonStub>deviceInfo.getScreenScale).returns(401);
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns('fake-device-id');
        (<sinon.SinonStub>deviceInfo.getOsVersion).returns('11');

        analyticsStorage = sinon.createStubInstance(AnalyticsStorage);
        (<sinon.SinonStub>analyticsStorage.getSessionId).resolves(1);
        (<sinon.SinonStub>analyticsStorage.getUserId).resolves('fake-user-id');

        promoEvents = new PromoEvents(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, analyticsStorage);
    });

    describe('getAppStoreFromReceipt', () => {
        it('should work with correctly formatted data', () => {
            const appStore = promoEvents.getAppStoreFromReceipt('{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}');
            assert.equal(appStore, 'GooglePlay');
        });

        it('should return \"unknown\" when store not found', () => {
            const appStore = promoEvents.getAppStoreFromReceipt('{\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}');
            assert.equal(appStore, 'unknown');
        });

        it('should return \"unknown\" when given undefined', () => {
            const appStore = promoEvents.getAppStoreFromReceipt(undefined);
            assert.equal(appStore, 'unknown');
        });

        it('should return \"unknown\" when given corrupt JSON', () => {
            const spy = sinon.spy(core.Sdk, 'logError');
            const appStore = promoEvents.getAppStoreFromReceipt('{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"]ad[]}');
            assert.equal(appStore, 'unknown');
            sinon.assert.calledOnce(spy);
        });
    });

    describe('onPurchaseSuccess', () => {
        it('should give success object', () => {
            return promoEvents.onPurchaseSuccess({
                store: 'GooglePlay',
                productId: '100.gold.coins',
                storeSpecificId: '100.gold.coins',
                amount: 1.99,
                currency: 'USD',
                native: true
            }, 'PREMIUM', '{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}')
            .then((successObject) => {
                assert.deepStrictEqual(successObject, {
                    store: 'GooglePlay',
                    productId: '100.gold.coins',
                    storeSpecificId: '100.gold.coins',
                    amount: 1.99,
                    currency: 'USD',
                    native: true,
                    platform: 'Ios',
                    appid: 'unit-test',
                    platformid: 8,
                    gameId: 'fake-game-id',
                    sdk_ver: '',
                    ads_sdk_ver: '3.0.0',
                    gamerToken: 'unit-test-gamer-token',
                    game_ver: '1.0',
                    osv: 'iOS 11',
                    orient: 'Landscape',
                    w: 2000,
                    h: 2000,
                    iap_ver: 'ads sdk',
                    userid: 'fake-user-id',
                    sessionid: 1,
                    trackingOptOut: true,
                    ppi: 401,
                    deviceid: 'fake-device-id',
                    request: 'purchase',
                    iapPromo: true,
                    type: 'iap.purchase',
                    iap_service: false,
                    purchase: 'OK',
                    productType: 'PREMIUM',
                    receipt: {
                        data: '{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}'
                    }
                }, `got ${JSON.stringify(successObject)}`);
            });
        });
    });

    describe('onPurchaseFailed', () => {
        it('should give failure object', () => {
            return promoEvents.onPurchaseFailed({
                store: 'GooglePlay',
                productId: '100.gold.coins',
                storeSpecificId: '100.gold.coins',
                amount: 1.99,
                currency: 'USD',
                native: true
            }, promoEvents.failureJson('fake-store-error', 'unit test failed', PurchasingFailureReason.UserCancelled, '100.gold.coins'))
            .then((failObject) => {
                assert.deepStrictEqual(failObject, {
                    store: 'GooglePlay',
                    productId: '100.gold.coins',
                    storeSpecificId: '100.gold.coins',
                    amount: 1.99,
                    currency: 'USD',
                    native: true,
                    platform: 'Ios',
                    appid: 'unit-test',
                    platformid: 8,
                    gameId: 'fake-game-id',
                    sdk_ver: '',
                    ads_sdk_ver: '3.0.0',
                    gamerToken: 'unit-test-gamer-token',
                    game_ver: '1.0',
                    osv: 'iOS 11',
                    orient: 'Landscape',
                    w: 2000,
                    h: 2000,
                    iap_ver: 'ads sdk',
                    userid: 'fake-user-id',
                    sessionid: 1,
                    trackingOptOut: true,
                    ppi: 401,
                    deviceid: 'fake-device-id',
                    request: 'purchase',
                    iapPromo: true,
                    type: 'iap.purchasefailed',
                    iap_service: false,
                    purchase: 'FAILED',
                    failureJSON: '{\"storeSpecificErrorCode\":\"fake-store-error\",\"message\":\"unit test failed\",\"reason\":\"UserCancelled\",\"productId\":\"100.gold.coins\"}'
                }, `got ${JSON.stringify(failObject)}`);
            });
        });
    });

    describe('getAppStoreFromReceipt', () => {
        it('should give GooglePlay for valid format', () => {
            const appstore = promoEvents.getAppStoreFromReceipt('{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}');
            assert.equal(appstore, 'GooglePlay');
        });

        it('should give \'unknown\' for undefined string', () => {
            const appstore = promoEvents.getAppStoreFromReceipt(undefined);
            assert.equal(appstore, 'unknown');
        });

        it('should return \'unknown\' if the json fails to parse', () => {
            const appstore = promoEvents.getAppStoreFromReceipt('["test":123]');
            assert.equal(appstore, 'unknown');
        });
    });
});
