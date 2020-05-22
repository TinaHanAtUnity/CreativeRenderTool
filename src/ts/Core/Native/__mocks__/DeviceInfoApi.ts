import { DeviceInfoApi as Base } from 'Core/Native/DeviceInfo';

export type DeviceInfoApiMock = Base & {
    Android: {
        getPackageInfo: jest.Mock;
    };
    getScreenWidth: jest.Mock;
    getScreenHeight: jest.Mock;
};

export const DeviceInfoApi = jest.fn(() => {
    return <DeviceInfoApiMock>{
        Android: {
            getPackageInfo: jest.fn().mockResolvedValue({ versionCode: 0 })
        },
        getScreenWidth: jest.fn().mockImplementation(() => Promise.resolve(567)),
        getScreenHeight: jest.fn().mockImplementation(() => Promise.resolve(1234))
    };
});
