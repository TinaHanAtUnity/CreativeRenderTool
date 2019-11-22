import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    CurrentUnityConsentVersion,
    IRawGamePrivacy,
    IRawUserPrivacy,
    PrivacyMethod,
    UserPrivacy
} from 'Privacy/Privacy';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

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
    assert.deepEqual(userPrivacy.getPermissions(), UserPrivacy.PERM_ALL_FALSE);
    assert.equal(privacySDK.isOptOutRecorded(), false);
    assert.equal(privacySDK.isOptOutEnabled(), false);
};

describe('PrivacyParserTest', () => {
    const platform = Platform.ANDROID;
    const clientInfo = TestFixtures.getClientInfo(platform);
    const deviceInfo: AndroidDeviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
    const testAdvertisingId = '128970986778678';
    beforeEach(() => {
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(testAdvertisingId);
    });

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

    context ('limitAdTracking enabled on device', () => {
        let privacyPartsConfig: IPrivacyPartsConfig;
        const privacyMethods = [undefined, PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT, PrivacyMethod.DEFAULT];
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: {method: PrivacyMethod.UNITY_CONSENT}
            };
            (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(true);
        });

        [true, false].forEach((gdprEnabled) => {
            privacyMethods.forEach((privacyMethod) => {
                it (`sets default privacy method with gdprEnabled=${gdprEnabled} and privacyMethod=${privacyMethod}`, () => {
                    privacyPartsConfig.gdprEnabled = gdprEnabled;
                    privacyPartsConfig.gamePrivacy = {method: privacyMethod};
                    let expectedGamePrivacyMethod = privacyMethod || PrivacyMethod.DEFAULT;
                    if (gdprEnabled === true && !privacyMethod) {
                        expectedGamePrivacyMethod = PrivacyMethod.LEGITIMATE_INTEREST;
                    }
                    const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    let expectedOptOutRecorded = true;
                    if (expectedGamePrivacyMethod === PrivacyMethod.DEFAULT) {
                        expectedOptOutRecorded = false;
                    }
                    assert.equal(gamePrivacy.getMethod(), expectedGamePrivacyMethod);
                    assert.equal(privacySDK.isGDPREnabled(), gdprEnabled);
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(userPrivacy.getMethod(), expectedGamePrivacyMethod);
                    assert.equal(userPrivacy.getVersion(), privacyMethod === PrivacyMethod.UNITY_CONSENT ? CurrentUnityConsentVersion : 0);
                    assert.deepEqual(userPrivacy.getPermissions(), UserPrivacy.PERM_ALL_FALSE);
                    assert.equal(privacySDK.isOptOutRecorded(), expectedOptOutRecorded);
                    assert.equal(privacySDK.isOptOutEnabled(), expectedOptOutRecorded ? true : false);
                });
            });
        });
    });

    context ('userPrivacy.method is DEVELOPER_CONSENT', () => {
        let privacyPartsConfig: IPrivacyPartsConfig;
        const otherPrivacyMethods = [PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEFAULT];

        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: {method: PrivacyMethod.UNITY_CONSENT},
                userPrivacy: {method: PrivacyMethod.DEVELOPER_CONSENT, version: 0, permissions: UserPrivacy.PERM_DEVELOPER_CONSENTED}
            };
            (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(false);
        });

        otherPrivacyMethods.forEach((gamePrivacyMethod) => {
            it (`and gamePrivacy.method is ${gamePrivacyMethod}, gamePrivacy.method should be updated to DEVELOPER_CONSENT`, () => {
                privacyPartsConfig.gamePrivacy = {method: gamePrivacyMethod};
                const expectedGamePrivacyMethod = PrivacyMethod.DEVELOPER_CONSENT;
                const privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyPartsConfig, clientInfo, deviceInfo);
                const gamePrivacy = privacySDK.getGamePrivacy();
                assert.equal(gamePrivacy.getMethod(), expectedGamePrivacyMethod);
                assert.equal(privacySDK.isGDPREnabled(), true);
                const userPrivacy = privacySDK.getUserPrivacy();
                assert.equal(userPrivacy.getMethod(), PrivacyMethod.DEVELOPER_CONSENT);
                assert.equal(userPrivacy.getVersion(), 0);
                assert.deepEqual(userPrivacy.getPermissions(), UserPrivacy.PERM_DEVELOPER_CONSENTED);
                assert.equal(privacySDK.isOptOutRecorded(), true);
                assert.equal(privacySDK.isOptOutEnabled(), false);
            });
        });
    });
});
