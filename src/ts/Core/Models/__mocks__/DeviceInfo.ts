import { DeviceInfo as Base } from 'Core/Models/DeviceInfo';

export type DeviceInfoMock = Base & {
};

export const DeviceInfo = jest.fn(() => {
    return <DeviceInfoMock><unknown>{};
});
