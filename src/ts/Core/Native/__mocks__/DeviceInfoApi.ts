import { DeviceInfoApi as Base } from 'Core/Native/DeviceInfo';

export type DeviceInfoApiMock = Base & {
    Android: {
        getPackageInfo: jest.Mock;
    };
};

export const DeviceInfoApi = jest.fn(() => {
    return <DeviceInfoApiMock>{
        Android: {
            getPackageInfo: jest.fn().mockResolvedValue({ versionCode: 0 })
        }
    };
});
