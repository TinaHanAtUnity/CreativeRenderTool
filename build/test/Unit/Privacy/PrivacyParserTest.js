import { CurrentUnityConsentVersion, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
const assertDefaultUserPrivacy = (privacySDK) => {
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
    const deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
    const testAdvertisingId = '128970986778678';
    beforeEach(() => {
        deviceInfo.getAdvertisingIdentifier.returns(testAdvertisingId);
    });
    context('Default privacy', () => {
        let privacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: false,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: { method: PrivacyMethod.DEFAULT }
            };
        });
        [true, false].forEach((gdprEnabled) => {
            [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
                it(`sets default privacy method with gdprEnabled=${gdprEnabled}, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                    privacyPartsConfig.gdprEnabled = gdprEnabled;
                    privacyPartsConfig.optOutRecorded = optOutRecorded;
                    privacyPartsConfig.optOutEnabled = optOutEnabled;
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.DEFAULT);
                    assertDefaultUserPrivacy(privacySDK);
                    assert.equal(privacySDK.isGDPREnabled(), gdprEnabled);
                });
            });
        });
    });
    context('Missing gamePrivacy', () => {
        let privacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: false,
                optOutRecorded: false,
                optOutEnabled: false
            };
        });
        [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
            it(`sets default privacy method with gdprEnabled=false, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                privacyPartsConfig.gdprEnabled = false;
                const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                const gamePrivacy = privacySDK.getGamePrivacy();
                assert.equal(gamePrivacy.getMethod(), PrivacyMethod.DEFAULT);
                assertDefaultUserPrivacy(privacySDK);
                assert.equal(privacySDK.isGDPREnabled(), false);
            });
        });
        context('when gdprEnabled = true', () => {
            [[true, true], [true, false], [false, false]].forEach(([optOutRecorded, optOutEnabled]) => {
                it(`sets privacy method to default (unrecorded) with gdprEnabled true, optOutRecorded=${optOutRecorded} and optOutEnabled=${optOutEnabled}`, () => {
                    privacyPartsConfig.gdprEnabled = true;
                    privacyPartsConfig.optOutRecorded = optOutRecorded;
                    privacyPartsConfig.optOutEnabled = optOutEnabled;
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.LEGITIMATE_INTEREST);
                    assertDefaultUserPrivacy(privacySDK);
                    assert.equal(privacySDK.isOptOutRecorded(), false);
                    assert.equal(privacySDK.isOptOutEnabled(), false);
                    assert.equal(privacySDK.isGDPREnabled(), true);
                });
            });
        });
    });
    [PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.DEVELOPER_CONSENT].forEach((privacyMethod) => {
        context(`${privacyMethod} gamePrivacy`, () => {
            let privacyPartsConfig;
            beforeEach(() => {
                privacyPartsConfig = {
                    gdprEnabled: true,
                    optOutRecorded: false,
                    optOutEnabled: false,
                    gamePrivacy: { method: privacyMethod }
                };
            });
            const unityConsentUserPrivacy = { method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: UserPrivacy.PERM_ALL_TRUE };
            [undefined, unityConsentUserPrivacy].forEach((configUserPrivacy) => {
                it('sets default userPrivacy when optoutRecroded=false and configuration has userPrivacy=' + JSON.stringify(configUserPrivacy), () => {
                    privacyPartsConfig.userPrivacy = configUserPrivacy;
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    assert.equal(gamePrivacy.getMethod(), privacyMethod);
                    assertDefaultUserPrivacy(privacySDK);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });
            [true, false].forEach((consent) => {
                it('set userPrivacy as provided when compatible, consent = ' + consent, () => {
                    privacyPartsConfig.userPrivacy = { method: privacyMethod, version: 0,
                        permissions: { ads: consent, external: consent, gameExp: false } };
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(gamePrivacy.getMethod(), privacyMethod);
                    assert.equal(userPrivacy.getMethod(), privacyMethod);
                    assert.equal(userPrivacy.getVersion(), 0);
                    assert.deepEqual(userPrivacy.getPermissions(), { ads: consent, external: consent, gameExp: false });
                    assert.equal(privacySDK.isOptOutRecorded(), true);
                    assert.equal(privacySDK.isOptOutEnabled(), !consent);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });
        });
    });
    context('unity_consent privacy', () => {
        let privacyPartsConfig;
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: { method: PrivacyMethod.UNITY_CONSENT }
            };
        });
        const legitimateInterestuserPrivacy = { method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0,
            permissions: { ads: true, external: true, gameExp: false } };
        [undefined, legitimateInterestuserPrivacy].forEach((configUserPrivacy) => {
            it('sets default userPrivacy method when userPrivacy = ' + JSON.stringify(configUserPrivacy), () => {
                privacyPartsConfig.userPrivacy = configUserPrivacy;
                const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                const gamePrivacy = privacySDK.getGamePrivacy();
                assert.equal(gamePrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                assertDefaultUserPrivacy(privacySDK);
                assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
            });
        });
        ['new', 'old'].forEach((consentVersionModifier) => {
            [true, false].forEach((consent) => {
                it(`set userPrivacy as provided when compatible and ${consentVersionModifier} version, consent = ${consent}`, () => {
                    const consentVersion = CurrentUnityConsentVersion - (consentVersionModifier === 'old' ? -1 : 0);
                    privacyPartsConfig.userPrivacy = { method: PrivacyMethod.UNITY_CONSENT, version: consentVersion,
                        permissions: { ads: consent, external: consent, gameExp: consent } };
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
                    const gamePrivacy = privacySDK.getGamePrivacy();
                    const userPrivacy = privacySDK.getUserPrivacy();
                    assert.equal(gamePrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                    assert.equal(userPrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
                    assert.equal(userPrivacy.getVersion(), consentVersion);
                    assert.deepEqual(userPrivacy.getPermissions(), { ads: consent, external: consent, gameExp: consent });
                    assert.equal(privacySDK.isOptOutRecorded(), true);
                    assert.equal(privacySDK.isOptOutEnabled(), !consent);
                    assert.equal(privacySDK.isGDPREnabled(), privacyPartsConfig.gdprEnabled);
                });
            });
        });
    });
    context('limitAdTracking enabled on device', () => {
        let privacyPartsConfig;
        const privacyMethods = [undefined, PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT, PrivacyMethod.DEFAULT];
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: { method: PrivacyMethod.UNITY_CONSENT }
            };
            deviceInfo.getLimitAdTracking.returns(true);
        });
        [true, false].forEach((gdprEnabled) => {
            privacyMethods.forEach((privacyMethod) => {
                it(`sets default privacy method with gdprEnabled=${gdprEnabled} and privacyMethod=${privacyMethod}`, () => {
                    privacyPartsConfig.gdprEnabled = gdprEnabled;
                    privacyPartsConfig.gamePrivacy = { method: privacyMethod };
                    let expectedGamePrivacyMethod = privacyMethod || PrivacyMethod.DEFAULT;
                    if (gdprEnabled === true && !privacyMethod) {
                        expectedGamePrivacyMethod = PrivacyMethod.LEGITIMATE_INTEREST;
                    }
                    const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
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
    context('userPrivacy.method is DEVELOPER_CONSENT', () => {
        let privacyPartsConfig;
        const otherPrivacyMethods = [PrivacyMethod.LEGITIMATE_INTEREST, PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEFAULT];
        beforeEach(() => {
            privacyPartsConfig = {
                gdprEnabled: true,
                optOutRecorded: false,
                optOutEnabled: false,
                gamePrivacy: { method: PrivacyMethod.UNITY_CONSENT },
                userPrivacy: { method: PrivacyMethod.DEVELOPER_CONSENT, version: 0, permissions: UserPrivacy.PERM_DEVELOPER_CONSENTED }
            };
            deviceInfo.getLimitAdTracking.returns(false);
        });
        otherPrivacyMethods.forEach((gamePrivacyMethod) => {
            it(`and gamePrivacy.method is ${gamePrivacyMethod}, gamePrivacy.method should be updated to DEVELOPER_CONSENT`, () => {
                privacyPartsConfig.gamePrivacy = { method: gamePrivacyMethod };
                const expectedGamePrivacyMethod = PrivacyMethod.DEVELOPER_CONSENT;
                const privacySDK = PrivacyParser.parse(privacyPartsConfig, clientInfo, deviceInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUHJpdmFjeS9Qcml2YWN5UGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQ0gsMEJBQTBCLEVBRzFCLGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFZbEUsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLFVBQXNCLEVBQUUsRUFBRTtJQUN4RCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDaEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzRSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUs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