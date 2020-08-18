import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

import { InstallInfo } from 'Core/Models/InstallInfo';

describe('InstallInfo', () => {
    const VALID_IDENTIFIER = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const PREFERENCES_IDFI_KEY = 'unityads-idfi';
    const COULDNT_GET_VALUE = 'COULDNT_GET_VALUE';
    const OTHER_ERROR = 'OTHER_ERROR';
    const ERROR_LOG = `InstalledInfo failed due to: \"${OTHER_ERROR}\"`;

    let core: ICore;
    let installInfo: InstallInfo;

    beforeEach(() => {
        core = new Core();
    });

    describe('on Android Platform', () => {
        const ANDROID_PREFERENCES_SETTINGS_FILE = 'unityads-installinfo';

        describe('when fetch is called the first time', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(COULDNT_GET_VALUE));
                core.Api.DeviceInfo.getUniqueEventId = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                core.Api.Android!.Preferences.setString = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should attempt to retrieve an identifier from preferences', () => {
                expect(core.Api.Android!.Preferences.getString).toHaveBeenCalledWith(ANDROID_PREFERENCES_SETTINGS_FILE, PREFERENCES_IDFI_KEY);
            });

            it('should store a newly generated identifier to preferences', () => {
                expect(core.Api.Android!.Preferences.setString).toHaveBeenCalledWith(ANDROID_PREFERENCES_SETTINGS_FILE, PREFERENCES_IDFI_KEY, VALID_IDENTIFIER);
            });
        });

        describe('when fetch is called with a stored value', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should retrieve the stored identifier from preferences', () => {
                expect(core.Api.Android!.Preferences.getString).toHaveBeenCalledWith(ANDROID_PREFERENCES_SETTINGS_FILE, PREFERENCES_IDFI_KEY);
            });
        });

        describe('getIdfi', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should return the retrieved identifier', () => {
                const IDFI = installInfo.getIdfi();
                expect(IDFI).toBe(VALID_IDENTIFIER);
            });
        });

        describe('when getString returns an error other than COULDNT_GET_VALUE', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(OTHER_ERROR));
                core.Api.Sdk.logError = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
            });

            it('rejects it', async () => {
                await installInfo.fetch().catch(e => {
                    expect(e).toBeDefined();
                });
                expect(core.Api.Sdk.logError).toHaveBeenCalledWith(ERROR_LOG);
            });
        });
    });

    describe('on iOS Platform', () => {

        describe('when fetch is called the first time', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(COULDNT_GET_VALUE));
                core.Api.DeviceInfo.getUniqueEventId = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                core.Api.iOS!.Preferences.setString = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should attempt to retrieve an identifier from preferences', () => {
                expect(core.Api.iOS!.Preferences.getString).toHaveBeenCalledWith(PREFERENCES_IDFI_KEY);
            });

            it('should store a newly generated identifier to preferences', () => {
                expect(core.Api.iOS!.Preferences.setString).toHaveBeenCalledWith(VALID_IDENTIFIER, PREFERENCES_IDFI_KEY);
            });
        });

        describe('when fetch is called with a stored value', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should retrieve the stored identifier from preferences', () => {
                expect(core.Api.iOS!.Preferences.getString).toHaveBeenCalledWith(PREFERENCES_IDFI_KEY);
            });
        });

        describe('getIdfi', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(VALID_IDENTIFIER));
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should return the retrieved identifier', () => {
                const IDFI = installInfo.getIdfi();
                expect(IDFI).toBe(VALID_IDENTIFIER);
            });
        });

        describe('when getString returns an error other than COULDNT_GET_VALUE', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(OTHER_ERROR));
                core.Api.Sdk.logError = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.IOS, core.Api);
            });

            it('rejects it', async () => {
                await installInfo.fetch().catch(e => {
                    expect(e).toBeDefined();
                });
                expect(core.Api.Sdk.logError).toHaveBeenCalledWith(ERROR_LOG);
            });
        });
    });
});
