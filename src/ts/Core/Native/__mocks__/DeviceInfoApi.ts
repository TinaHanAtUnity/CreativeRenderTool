import { DeviceInfoApi as Base } from 'Core/Native/DeviceInfo';

export type DeviceInfoApiMock = Base & {
};

export const DeviceInfoApi = jest.fn(() => {
    return <DeviceInfoApiMock>{
    };
});
