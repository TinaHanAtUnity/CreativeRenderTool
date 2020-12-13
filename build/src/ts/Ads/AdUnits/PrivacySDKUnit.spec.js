import { PrivacySDKUnit } from 'Ads/AdUnits/PrivacySDKUnit';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Core } from 'Core/__mocks__/Core';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { Platform } from 'Core/Constants/Platform';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AgeGateChoice, AgeGateSource, GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { GamePrivacy, UserPrivacy } from 'Privacy/Privacy';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
jest.mock('Ads/Views/Privacy/PrivacySDKView');
describe('PrivacySDKUnit', () => {
    describe('onPrivacyCompleted callback', () => {
        describe('when callback contains error', () => {
            let privacySDKUnit;
            let params;
            beforeEach(() => {
                params = {
                    abGroup: new CoreConfiguration().getAbGroup(),
                    adsConfig: new AdsConfiguration(),
                    deviceInfo: new DeviceInfo(),
                    platform: Platform.TEST,
                    core: new Core().Api,
                    requestManager: new RequestManager(),
                    privacyManager: new UserPrivacyManager(),
                    adUnitContainer: new AdUnitContainer(),
                    privacySDK: new PrivacySDK()
                };
                privacySDKUnit = new PrivacySDKUnit(params);
                let completedParams;
                completedParams = {
                    user: {
                        ads: false,
                        external: false,
                        gameExp: false,
                        ageGateChoice: AgeGateChoice.NO,
                        agreementMethod: ''
                    },
                    error: 'error'
                };
                privacySDKUnit.closePrivacy = jest.fn();
                privacySDKUnit['handlePrivacySettings'] = jest.fn();
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });
            it('does not handle privacy settings', () => {
                expect(privacySDKUnit['handlePrivacySettings']).not.toHaveBeenCalled();
            });
            it('calls closePrivacy', () => {
                expect(privacySDKUnit.closePrivacy).toHaveBeenCalledWith();
            });
        });
        describe('when callback does NOT contain error', () => {
            let privacySDKUnit;
            let completedParams;
            let params;
            beforeEach(() => {
                params = {
                    abGroup: new CoreConfiguration().getAbGroup(),
                    adsConfig: new AdsConfiguration(),
                    deviceInfo: new DeviceInfo(),
                    platform: Platform.TEST,
                    core: new Core().Api,
                    requestManager: new RequestManager(),
                    privacyManager: new UserPrivacyManager(),
                    adUnitContainer: new AdUnitContainer(),
                    privacySDK: new PrivacySDK()
                };
                privacySDKUnit = new PrivacySDKUnit(params);
                completedParams = {
                    user: {
                        ads: false,
                        external: false,
                        gameExp: false,
                        ageGateChoice: AgeGateChoice.NO,
                        agreementMethod: ''
                    }
                };
                privacySDKUnit.closePrivacy = jest.fn();
                privacySDKUnit['handlePrivacySettings'] = jest.fn();
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });
            it('handles privacy settings', () => {
                expect(privacySDKUnit['handlePrivacySettings']).toHaveBeenCalledWith(completedParams.user);
            });
            it('calls closePrivacy', () => {
                expect(privacySDKUnit.closePrivacy).toHaveBeenCalledWith();
            });
        });
    });
    describe('handlePrivacySettings', () => {
        let params;
        beforeEach(() => {
            params = {
                abGroup: new CoreConfiguration().getAbGroup(),
                adsConfig: new AdsConfiguration(),
                deviceInfo: new DeviceInfo(),
                platform: Platform.TEST,
                core: new Core().Api,
                requestManager: new RequestManager(),
                privacyManager: new UserPrivacyManager(),
                adUnitContainer: new AdUnitContainer(),
                privacySDK: new PrivacySDK()
            };
        });
        describe('when age gate is NOT enabled', () => {
            let privacySDKUnit;
            beforeEach(() => {
                params.privacySDK.getAgeGateLimit = jest.fn().mockReturnValue(0);
                params.privacyManager.setUsersAgeGateChoice = jest.fn();
                params.privacyManager.updateUserPrivacy = jest.fn();
                privacySDKUnit = new PrivacySDKUnit(params);
                let completedParams;
                completedParams = {
                    user: Object.assign({}, UserPrivacy.PERM_ALL_FALSE, { ageGateChoice: AgeGateChoice.MISSING, agreementMethod: '' })
                };
                jest.spyOn(privacySDKUnit, 'setConsent');
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });
            it('does NOT call setUsersAgeGateChoice', () => {
                expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice).not.toHaveBeenCalled();
            });
            it('calls updateUserPrivacy with correct parameters', () => {
                expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                    .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE, GDPREventSource.USER, GDPREventAction.CONSENT_SAVE_CHOICES, ConsentPage.HOMEPAGE);
            });
            it('calls setConsent with correct parameters', () => {
                expect(privacySDKUnit.setConsent)
                    .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE, GDPREventAction.CONSENT_SAVE_CHOICES, GDPREventSource.USER);
            });
        });
        describe('when age gate is enabled AND developer age gate is used', () => {
            let privacySDKUnit;
            beforeEach(() => {
                params.privacySDK.getAgeGateLimit = jest.fn().mockReturnValue(15);
                params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(true);
                params.privacyManager.setUsersAgeGateChoice = jest.fn();
                params.privacyManager.updateUserPrivacy = jest.fn();
                privacySDKUnit = new PrivacySDKUnit(params);
                let completedParams;
                completedParams = {
                    user: Object.assign({}, UserPrivacy.PERM_ALL_TRUE, { ageGateChoice: AgeGateChoice.MISSING, agreementMethod: '' })
                };
                jest.spyOn(privacySDKUnit, 'setConsent');
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });
            it('does NOT call setUsersAgeGateChoice', () => {
                expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice).not.toHaveBeenCalled();
            });
            it('calls updateUserPrivacy with correct parameters', () => {
                expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                    .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE, GDPREventSource.USER, GDPREventAction.CONSENT_SAVE_CHOICES, ConsentPage.HOMEPAGE);
            });
            it('calls setConsent with correct parameters', () => {
                expect(privacySDKUnit.setConsent)
                    .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE, GDPREventAction.CONSENT_SAVE_CHOICES, GDPREventSource.USER);
            });
        });
        describe('when age gate is enabled and developer age gate is NOT used', () => {
            describe('when user has NOT passed age gate', () => {
                let privacySDKUnit;
                beforeEach(() => {
                    params = {
                        abGroup: new CoreConfiguration().getAbGroup(),
                        adsConfig: new AdsConfiguration(),
                        deviceInfo: new DeviceInfo(),
                        platform: Platform.TEST,
                        core: new Core().Api,
                        requestManager: new RequestManager(),
                        privacyManager: new UserPrivacyManager(),
                        adUnitContainer: new AdUnitContainer(),
                        privacySDK: new PrivacySDK()
                    };
                    params.privacySDK.isAgeGateEnabled = jest.fn().mockReturnValue(true);
                    params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(false);
                    params.privacyManager.setUsersAgeGateChoice = jest.fn();
                    params.privacyManager.updateUserPrivacy = jest.fn();
                    privacySDKUnit = new PrivacySDKUnit(params);
                    let completedParams;
                    completedParams = {
                        user: Object.assign({}, UserPrivacy.PERM_ALL_FALSE, { ageGateChoice: AgeGateChoice.NO, agreementMethod: '' })
                    };
                    jest.spyOn(privacySDKUnit, 'setConsent');
                    privacySDKUnit.onPrivacyCompleted(completedParams);
                });
                it('does NOT call setConsent', () => {
                    expect(privacySDKUnit.setConsent).not.toHaveBeenCalled();
                });
                it('calls setUsersAgeGateChoice with correct params', () => {
                    expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice)
                        .toHaveBeenCalledWith(AgeGateChoice.NO, AgeGateSource.USER);
                });
                it('calls updateUserPrivacy with correct parameters', () => {
                    expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                        .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE, GDPREventSource.USER, GDPREventAction.AGE_GATE_DISAGREE);
                });
            });
            describe('when user has passed age gate', () => {
                beforeEach(() => {
                    params = {
                        abGroup: new CoreConfiguration().getAbGroup(),
                        adsConfig: new AdsConfiguration(),
                        deviceInfo: new DeviceInfo(),
                        platform: Platform.TEST,
                        core: new Core().Api,
                        requestManager: new RequestManager(),
                        privacyManager: new UserPrivacyManager(),
                        adUnitContainer: new AdUnitContainer(),
                        privacySDK: new PrivacySDK()
                    };
                });
                describe('when privacy method is unity_consent, all permissions true', () => {
                    let privacySDKUnit;
                    beforeEach(() => {
                        params.privacySDK.isAgeGateEnabled = jest.fn().mockReturnValue(true);
                        params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(false);
                        params.privacySDK.getGamePrivacy = jest.fn().mockReturnValue(new GamePrivacy({
                            method: 'unity_consent'
                        }));
                        params.privacyManager.setUsersAgeGateChoice = jest.fn();
                        params.privacyManager.updateUserPrivacy = jest.fn();
                        privacySDKUnit = new PrivacySDKUnit(params);
                        const completedParams = {
                            user: Object.assign({}, UserPrivacy.PERM_ALL_TRUE, { ageGateChoice: AgeGateChoice.YES, agreementMethod: 'all' })
                        };
                        jest.spyOn(privacySDKUnit, 'setConsent');
                        privacySDKUnit.onPrivacyCompleted(completedParams);
                    });
                    it('calls setUsersAgeGateChoice with correct params', () => {
                        expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice)
                            .toHaveBeenCalledWith(AgeGateChoice.YES, AgeGateSource.USER);
                    });
                    it('calls setConsent with correct params', () => {
                        expect(privacySDKUnit.setConsent)
                            .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE, GDPREventAction.CONSENT_AGREE_ALL, GDPREventSource.USER);
                    });
                    it('calls updateUserPrivacy with correct parameters', () => {
                        expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                            .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE, GDPREventSource.USER, GDPREventAction.CONSENT_AGREE_ALL, ConsentPage.AGE_GATE);
                    });
                });
                describe('when privacy method is NOT unity_consent', () => {
                    let privacySDKUnit;
                    beforeEach(() => {
                        params.privacySDK.isAgeGateEnabled = jest.fn().mockReturnValue(true);
                        params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(false);
                        params.privacySDK.getGamePrivacy = jest.fn().mockReturnValue(new GamePrivacy({
                            method: 'default'
                        }));
                        params.privacyManager.setUsersAgeGateChoice = jest.fn();
                        params.privacyManager.updateUserPrivacy = jest.fn();
                        privacySDKUnit = new PrivacySDKUnit(params);
                        let completedParams;
                        completedParams = {
                            user: Object.assign({}, UserPrivacy.PERM_ALL_FALSE, { ageGateChoice: AgeGateChoice.YES, agreementMethod: '' })
                        };
                        jest.spyOn(privacySDKUnit, 'setConsent');
                        privacySDKUnit.onPrivacyCompleted(completedParams);
                    });
                    it('calls setUsersAgeGateChoice with correct params', () => {
                        expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice)
                            .toHaveBeenCalledWith(AgeGateChoice.YES, AgeGateSource.USER);
                    });
                    it('does NOT call setConsent', () => {
                        expect(privacySDKUnit.setConsent).not.toHaveBeenCalled();
                    });
                    it('does NOT call updateUserPrivacy', () => {
                        expect(privacySDKUnit['_privacyManager'].updateUserPrivacy).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNES1VuaXQuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvQWRVbml0cy9Qcml2YWN5U0RLVW5pdC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBMEIsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzFELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2pILE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztBQUU5QyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBQzVCLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDekMsUUFBUSxDQUFDLDhCQUE4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