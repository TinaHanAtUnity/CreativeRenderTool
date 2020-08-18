import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

import { InstallInfo } from 'Core/Models/InstallInfo';

describe('InstallInfo', () => {
    const validIdentifier = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const getStringNotFoundError = 'COULDNT_GET_VALUE';
    const getStringOtherError = 'OTHER_ERROR';
    const preferencesIdfiKey = 'unityads-idfi';
    const errorLog = `InstalledInfo failed due to: \"${getStringOtherError}\"`;

    let core: ICore;
    let installInfo: InstallInfo;

    beforeEach(() => {
        core = new Core();
    });

    describe('on Android Platform', () => {
        const androidPreferencesSettingsFile = 'unityads-installinfo';

        describe('when fetch is called the first time', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(getStringNotFoundError));
                core.Api.DeviceInfo.getUniqueEventId = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                core.Api.Android!.Preferences.setString = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should attempt to retrieve an identifier from preferences', () => {
                expect(core.Api.Android!.Preferences.getString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey);
            });

            it('should store a newly generated identifier to preferences', () => {
                expect(core.Api.Android!.Preferences.setString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey, validIdentifier);
            });
        });

        describe('when fetch is called with a stored value', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should retrieve the stored identifier from preferences', () => {
                expect(core.Api.Android!.Preferences.getString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey);
            });
        });

        describe('getIdfi', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
                return installInfo.fetch();
            });

            it('should return the retrieved identifier', () => {
                const idfi = installInfo.getIdfi();
                expect(idfi).toBe(validIdentifier);
            });
        });

        describe('when getString returns an error other than COULDNT_GET_VALUE', () => {
            beforeEach(() => {
                core.Api.Android!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(getStringOtherError));
                core.Api.Sdk.logError = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.ANDROID, core.Api);
            });

            it('rejects it', async () => {
                await installInfo.fetch().catch(e => {
                    expect(e).toBeDefined();
                });
                expect(core.Api.Sdk.logError).toHaveBeenCalledWith(errorLog);
            });
        });
    });

    describe('on iOS Platform', () => {

        describe('when fetch is called the first time', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(getStringNotFoundError));
                core.Api.DeviceInfo.getUniqueEventId = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                core.Api.iOS!.Preferences.setString = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should attempt to retrieve an identifier from preferences', () => {
                expect(core.Api.iOS!.Preferences.getString).toHaveBeenCalledWith(preferencesIdfiKey);
            });

            it('should store a newly generated identifier to preferences', () => {
                expect(core.Api.iOS!.Preferences.setString).toHaveBeenCalledWith(validIdentifier, preferencesIdfiKey);
            });
        });

        describe('when fetch is called with a stored value', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should retrieve the stored identifier from preferences', () => {
                expect(core.Api.iOS!.Preferences.getString).toHaveBeenCalledWith(preferencesIdfiKey);
            });
        });

        describe('getIdfi', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
                installInfo = new InstallInfo(Platform.IOS, core.Api);
                return installInfo.fetch();
            });

            it('should return the retrieved identifier', () => {
                const idfi = installInfo.getIdfi();
                expect(idfi).toBe(validIdentifier);
            });
        });

        describe('when getString returns an error other than COULDNT_GET_VALUE', () => {
            beforeEach(() => {
                core.Api.iOS!.Preferences.getString = jest.fn().mockReturnValue(Promise.reject(getStringOtherError));
                core.Api.Sdk.logError = jest.fn().mockImplementation(() => Promise.resolve());
                installInfo = new InstallInfo(Platform.IOS, core.Api);
            });

            it('rejects it', async () => {
                await installInfo.fetch().catch(e => {
                    expect(e).toBeDefined();
                });
                expect(core.Api.Sdk.logError).toHaveBeenCalledWith(errorLog);
            });
        });
    });
});
