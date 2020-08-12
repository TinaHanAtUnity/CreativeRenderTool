import { Platform } from 'Core/Constants/Platform';
import { InstallInfo } from 'Core/Models/InstallInfo';
import { ICore } from 'Core/ICore';
import { Core } from 'Core/__mocks__/Core';

describe('InstallInfoTest', () => {
    const validIdentifier = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const getStringError = 'COULDNT_GET_VALUE';

    const platform = Platform.ANDROID;
    let core: ICore;
    let installInfo: InstallInfo;

    describe('getInstallIdentifier ', () => {
        it('should create and return a new identifier if an identifier is not set', () => {
            core = new Core();
            expect(core).toBeDefined();
            expect(core.Api).toBeDefined();
            expect(core.Api.Android).toBeDefined();
            if (core && core.Api && core.Api.Android) {
                core.Api.Android.Preferences.getString = jest.fn(() => Promise.reject(getStringError));
                core.Api.DeviceInfo.getUniqueEventId = jest.fn(() => Promise.resolve(validIdentifier));
                core.Api.Android.Preferences.setString = jest.fn(() => Promise.resolve());
            }
            installInfo = new InstallInfo(platform, core.Api);
            installInfo.fetch().then(() => {
                const idfi = installInfo.getIdentifierForInstall();
                expect(idfi).toBeDefined();
                expect(idfi).toBe(validIdentifier);
            });
        });

        it('should return a identifier if it is set', () => {
            if (core.Api.Android) {
                core.Api.Android.Preferences.getString = jest.fn().mockReturnValue(Promise.resolve(validIdentifier));
            }
            installInfo = new InstallInfo(platform, core.Api);
            installInfo.fetch().then(() => {
                const idfi = installInfo.getIdentifierForInstall();
                expect(idfi).toBeDefined();
                expect(idfi).toBe(validIdentifier);
            });
        });
    });
});
