import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    CurrentUnityConsentVersion,
    IRawGamePrivacy,
    IRawUserPrivacy,
    PrivacyMethod, UserPrivacy
} from 'Privacy/Privacy';
import { assert } from 'chai';
import 'mocha';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';

interface IPrivacyPartsConfig {
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    gamePrivacy: IRawGamePrivacy;
    userPrivacy?: IRawUserPrivacy;
    ageGateLimit?: number | undefined;
    legalFramework?: LegalFramework | undefined;
}

const assertDefaultUserPrivacy = (privacySDK: PrivacySDK) => {
    const userPrivacy = privacySDK.getUserPrivacy();
    assert.equal(userPrivacy.getMethod(), PrivacyMethod.DEFAULT);
    assert.equal(userPrivacy.getVersion(), 0);
    assert.deepEqual(userPrivacy.getPermissions(), {ads: false, external: false, gameExp: false});
    assert.equal(privacySDK.isOptOutRecorded(), false);
    assert.equal(privacySDK.isOptOutEnabled(), false);
};

describe('PrivacyParserTest', () => {
    const platform = Platform.ANDROID;
    const backend = TestFixtures.getBackend(platform);
    const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
    const coreModule = TestFixtures.getCoreModule(nativeBridge);
    const core = coreModule.Api;
    const clientInfo = TestFixtures.getClientInfo(platform);
    const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

    context ('Default privacy', () => {
        let privacyPartsConfig: IPrivacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: false,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: {method: PrivacyMethod.DEFAULT}
            };
        });

        [true, false].forEach((gdprEnabled) => {
            [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
                it (`sets default privacy method with gdprEnabled=${gdprEnabled}, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                    privacyPartsConfig.gdprEnabled = gdprEnabled;
                    privacyPartsConfig.optOutRecorded = optOutRecorded;
                    privacyPartsConfig.optOutEnabled = optOutEnabled;
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.DEFAULT);
                    assertDefaultUserPrivacy(privacySDK);
                    assert.equal(privacySDK.isGDPREnabled(), gdprEnabled);
                });
            });

        });
    });

    context ('Missing gamePrivacy', () => {
        let privacyPartsConfig: IPrivacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = <IPrivacyPartsConfig>{
                gdprEnabled: false,
                optOutRecorded: false,
                optOutEnabled: false
            };
        });

        [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
            it(`sets default privacy method with gdprEnabled=false, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                privacyPartsConfig.gdprEnabled = false;
                const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                const gamePrivacy = privacySDK.getGamePrivacy();
                assert.equal(gamePrivacy.getMethod(), PrivacyMethod.DEFAULT);
                assertDefaultUserPrivacy(privacySDK);
                assert.equal(privacySDK.isGDPREnabled(), false);
            });
        });

        context ('when gdprEnabled = true', () => {
            [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
                it (`sets privacy method legitimiate_interest with gdprEnabled true, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                    privacyPartsConfig.gdprEnabled = true;
                    privacyPartsConfig.optOutRecorded = optOutRecorded;
                    privacyPartsConfig.optOutEnabled = optOutEnabled;
                    const consent = optOutRecorded ? !optOutEnabled : false;
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.LEGITIMATE_INTEREST);
                    assert.equal(userPrivacy.getMethod(), optOutRecorded ? PrivacyMethod.LEGITIMATE_INTEREST : PrivacyMethod.DEFAULT);
                    assert.equal(userPrivacy.getVersion(), 0);
                    assert.deepEqual(userPrivacy.getPermissions(), {ads: consent, external: consent, gameExp: false});
                    assert.equal(privacySDK.isOptOutRecorded(), optOutRecorded);
                    assert.equal(privacySDK.isOptOutEnabled(), optOutRecorded ? !consent : false);
                    assert.equal(privacySDK.isGDPREnabled(), true);
                });
            });
        });
    });

    [PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.DEVELOPER_CONSENT].forEach((privacyMethod) => {
        context (`${privacyMethod} gamePrivacy`, () => {
            let privacyPartsConfig: IPrivacyPartsConfig;
            beforeEach(() => {
                privacyPartsConfig = {
                    gdprEnabled: true,
                    optOutRecorded: false,
                    optOutEnabled: false,
                    gamePrivacy: {method: privacyMethod}
                };
            });
            const unityConsentUserPrivacy = {method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: UserPrivacy.PERM_ALL_TRUE};
            [undefined, unityConsentUserPrivacy].forEach((configUserPrivacy) => {
                it ('sets default userPrivacy when optoutRecroded=false and configuration has userPrivacy=' + JSON.stringify(configUserPrivacy), () => {
                    privacyPartsConfig.userPrivacy = configUserPrivacy;
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    assert.equal(gamePrivacy.getMethod(), privacyMethod);
                    assertDefaultUserPrivacy(privacySDK);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });

            [true, false].forEach((consent) => {
                it ('set userPrivacy as provided when compatible, consent = ' + consent, () => {
                    privacyPartsConfig.userPrivacy = {method: privacyMethod, version: 0,
                        permissions: {ads: consent, external: consent, gameExp: false}};
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(gamePrivacy.getMethod(), privacyMethod);
                    assert.equal(userPrivacy.getMethod(), privacyMethod);
                    assert.equal(userPrivacy.getVersion(), 0);
                    assert.deepEqual(userPrivacy.getPermissions(), {ads: consent, external: consent, gameExp: false});
                    assert.equal(privacySDK.isOptOutRecorded(), true);
                    assert.equal(privacySDK.isOptOutEnabled(), !consent);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });
        });
    });

    context ('unity_consent privacy', () => {
        let privacyPartsConfig: IPrivacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: {method: PrivacyMethod.UNITY_CONSENT}
            };
        });
        const legitimateInterestuserPrivacy = {method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0,
            permissions: {ads: true, external: true, gameExp: false}};

        [undefined, legitimateInterestuserPrivacy].forEach((configUserPrivacy) => {
            it ('sets default userPrivacy method when userPrivacy = ' + JSON.stringify(configUserPrivacy), () => {
                privacyPartsConfig.userPrivacy = configUserPrivacy;
                const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                const gamePrivacy = privacySDK.getGamePrivacy();
                assert.equal(gamePrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                assertDefaultUserPrivacy(privacySDK);
                assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
            });
        });

        ['new', 'old'].forEach((consentVersionModifier) => {
            [true, false].forEach((consent) => {
                it (`set userPrivacy as provided when compatible and ${consentVersionModifier} version, consent = ${consent}`, () => {
                    const consentVersion = CurrentUnityConsentVersion - (consentVersionModifier === 'old' ? -1 : 0);
                    privacyPartsConfig.userPrivacy = {method: PrivacyMethod.UNITY_CONSENT, version: consentVersion,
                        permissions: {ads: consent, external: consent, gameExp: consent}};
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                    assert.equal(userPrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                    assert.equal(userPrivacy.getVersion(), consentVersion);
                    assert.deepEqual(userPrivacy.getPermissions(), {ads: consent, external: consent, gameExp: consent});
                    assert.equal(privacySDK.isOptOutRecorded(), true);
                    assert.equal(privacySDK.isOptOutEnabled(), !consent);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });
        });
    });
});
