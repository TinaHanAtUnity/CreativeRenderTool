import { IPrivacyUnitParameters, PrivacySDKUnit } from 'Ads/AdUnits/PrivacySDKUnit';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Core } from 'Core/__mocks__/Core';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { Platform } from 'Core/Constants/Platform';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { IPrivacyCompletedParams } from 'Privacy/IPrivacySettings';
import { AgeGateChoice, AgeGateSource, GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { GamePrivacy, UserPrivacy } from 'Privacy/Privacy';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';

jest.mock('Ads/Views/Privacy/PrivacySDKView');

describe('PrivacySDKUnit', () => {
    describe('onPrivacyCompleted callback', () => {
        describe('when callback contains error', () => {
            let privacySDKUnit: PrivacySDKUnit;
            let params: IPrivacyUnitParameters;

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
                let completedParams: IPrivacyCompletedParams;

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
            let privacySDKUnit: PrivacySDKUnit;
            let completedParams: IPrivacyCompletedParams;
            let params: IPrivacyUnitParameters;

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
        let params: IPrivacyUnitParameters;

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
            let privacySDKUnit: PrivacySDKUnit;

            beforeEach(() => {
                params.privacySDK.getAgeGateLimit = jest.fn().mockReturnValue(0);
                params.privacyManager.setUsersAgeGateChoice = jest.fn();
                params.privacyManager.updateUserPrivacy = jest.fn();

                privacySDKUnit = new PrivacySDKUnit(params);
                let completedParams: IPrivacyCompletedParams;

                completedParams = {
                    user: {
                        ...UserPrivacy.PERM_ALL_FALSE,
                        ageGateChoice: AgeGateChoice.MISSING,
                        agreementMethod: ''
                    }
                };

                jest.spyOn(privacySDKUnit, 'setConsent');
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });

            it('does NOT call setUsersAgeGateChoice', () => {
                expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice).not.toHaveBeenCalled();
            });

            it('calls updateUserPrivacy with correct parameters', () => {
                expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                  .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE,
                    GDPREventSource.USER,
                    GDPREventAction.CONSENT_SAVE_CHOICES,
                    ConsentPage.HOMEPAGE);
            });

            it('calls setConsent with correct parameters', () => {
                expect(privacySDKUnit.setConsent)
                  .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE,
                    GDPREventAction.CONSENT_SAVE_CHOICES,
                    GDPREventSource.USER);
            });
        });

        describe('when age gate is enabled AND developer age gate is used', () => {
            let privacySDKUnit: PrivacySDKUnit;

            beforeEach(() => {
                params.privacySDK.getAgeGateLimit = jest.fn().mockReturnValue(15);
                params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(true);
                params.privacyManager.setUsersAgeGateChoice = jest.fn();
                params.privacyManager.updateUserPrivacy = jest.fn();

                privacySDKUnit = new PrivacySDKUnit(params);
                let completedParams: IPrivacyCompletedParams;

                completedParams = {
                    user: {
                        ...UserPrivacy.PERM_ALL_TRUE,
                        ageGateChoice: AgeGateChoice.MISSING,
                        agreementMethod: ''
                    }
                };

                jest.spyOn(privacySDKUnit, 'setConsent');
                privacySDKUnit.onPrivacyCompleted(completedParams);
            });

            it('does NOT call setUsersAgeGateChoice', () => {
                expect(privacySDKUnit['_privacyManager'].setUsersAgeGateChoice).not.toHaveBeenCalled();
            });

            it('calls updateUserPrivacy with correct parameters', () => {
                expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                  .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE,
                    GDPREventSource.USER,
                    GDPREventAction.CONSENT_SAVE_CHOICES,
                    ConsentPage.HOMEPAGE);
            });

            it('calls setConsent with correct parameters', () => {
                expect(privacySDKUnit.setConsent)
                  .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE,
                    GDPREventAction.CONSENT_SAVE_CHOICES,
                    GDPREventSource.USER);
            });
        });

        describe('when age gate is enabled and developer age gate is NOT used', () => {
            describe('when user has NOT passed age gate', () => {
                let privacySDKUnit: PrivacySDKUnit;

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
                    let completedParams: IPrivacyCompletedParams;

                    completedParams = {
                        user: {
                            ...UserPrivacy.PERM_ALL_FALSE,
                            ageGateChoice: AgeGateChoice.NO,
                            agreementMethod: ''
                        }
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
                      .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_FALSE,
                        GDPREventSource.USER,
                        GDPREventAction.AGE_GATE_DISAGREE);
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
                    let privacySDKUnit: PrivacySDKUnit;

                    beforeEach(() => {
                        params.privacySDK.isAgeGateEnabled = jest.fn().mockReturnValue(true);
                        params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(false);
                        params.privacySDK.getGamePrivacy = jest.fn().mockReturnValue(new GamePrivacy({
                            method: 'unity_consent'
                        }));
                        params.privacyManager.setUsersAgeGateChoice = jest.fn();
                        params.privacyManager.updateUserPrivacy = jest.fn();

                        privacySDKUnit = new PrivacySDKUnit(params);
                        const completedParams: IPrivacyCompletedParams = {
                            user: {
                                ...UserPrivacy.PERM_ALL_TRUE,
                                ageGateChoice: AgeGateChoice.YES,
                                agreementMethod: 'all'
                            }
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
                          .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE,
                            GDPREventAction.CONSENT_AGREE_ALL,
                            GDPREventSource.USER);
                    });

                    it('calls updateUserPrivacy with correct parameters', () => {
                        expect(privacySDKUnit['_privacyManager'].updateUserPrivacy)
                          .toHaveBeenCalledWith(UserPrivacy.PERM_ALL_TRUE,
                            GDPREventSource.USER,
                            GDPREventAction.CONSENT_AGREE_ALL,
                            ConsentPage.AGE_GATE);
                    });
                });

                describe('when privacy method is NOT unity_consent', () => {
                    let privacySDKUnit: PrivacySDKUnit;

                    beforeEach(() => {
                        params.privacySDK.isAgeGateEnabled = jest.fn().mockReturnValue(true);
                        params.privacyManager.isDeveloperAgeGateActive = jest.fn().mockReturnValue(false);
                        params.privacySDK.getGamePrivacy = jest.fn().mockReturnValue(new GamePrivacy({
                            method: 'default'
                        }));
                        params.privacyManager.setUsersAgeGateChoice = jest.fn();
                        params.privacyManager.updateUserPrivacy = jest.fn();

                        privacySDKUnit = new PrivacySDKUnit(params);
                        let completedParams: IPrivacyCompletedParams;

                        completedParams = {
                            user: {
                                ...UserPrivacy.PERM_ALL_FALSE,
                                ageGateChoice: AgeGateChoice.YES,
                                agreementMethod: ''
                            }
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
