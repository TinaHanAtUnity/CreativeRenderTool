import { DeviceIdManager as Base } from 'Core/Managers/DeviceIdManager';

export type DeviceIdManagerMock = Base & {
};

export const DeviceIdManager = jest.fn(() => {
    return <DeviceIdManagerMock>{};
});
