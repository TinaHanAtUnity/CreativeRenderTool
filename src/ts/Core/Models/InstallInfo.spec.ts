import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

import { InstallInfo } from 'Core/Models/InstallInfo';

describe('InstallInfo', () => {
    const validIdentifier = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const getStringError = 'COULDNT_GET_VALUE';
    const androidPreferencesSettingsFile = 'uads-instllinfo';
    const preferencesIdfiKey = 'uads-idfi';

    let core: ICore;
    let installInfo: InstallInfo;

    describe('when fetch is called the first time', () => {
        beforeEach(async () => {
            core = new Core();
            if (core.Api.Android === undefined) {
                fail('core.Api.Android should not be undefined');
            }
            core.Api.Android.Preferences.getString = jest.fn(() => Promise.reject(getStringError));
            core.Api.DeviceInfo.getUniqueEventId = jest.fn(() => Promise.resolve(validIdentifier));
            core.Api.Android.Preferences.setString = jest.fn(() => Promise.resolve());
            installInfo = new InstallInfo(Platform.ANDROID, core.Api);
            await installInfo.fetch();
        });

        it('should attempt to retrieve an identifier from preferences', () => {
            if (core.Api.Android === undefined) {
                fail('core.Api.Android should not be undefined');
            }
            expect(core.Api.Android.Preferences.getString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey);
        });

        it('should store a newly generated identifier to preferences', () => {
            if (core.Api.Android === undefined) {
                fail('core.Api.Android should not be undefined');
            }
            expect(core.Api.Android.Preferences.setString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey, validIdentifier);
        });

        describe('getIdentifierForInstall', () => {
            it('should return the retrieved identifier', () => {
                const idfi = installInfo.getIdentifierForInstall();
                expect(idfi).toBe(validIdentifier);
            });
        });
    });

    describe('when fetch is called with a stored value', () => {
        beforeEach(async () => {
            core = new Core();
            if (core.Api.Android === undefined) {
                fail('core.Api.Android should not be undefined');
            }
            core.Api.Android.Preferences.getString = jest.fn(() => Promise.resolve(validIdentifier));
            installInfo = new InstallInfo(Platform.ANDROID, core.Api);
            await installInfo.fetch();
        });

        it('should retrieve the stored identifier from preferences', () => {
            if (core.Api.Android === undefined) {
                fail('core.Api.Android should not be undefined');
            }
            expect(core.Api.Android.Preferences.getString).toHaveBeenCalledWith(androidPreferencesSettingsFile, preferencesIdfiKey);
        });

        describe('getIdentifierForInstall', () => {
            it('should return the retrieved identifier', () => {
                const idfi = installInfo.getIdentifierForInstall();
                expect(idfi).toBe(validIdentifier);
            });
        });
    });
});
