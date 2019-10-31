import { SensorInfoApi as Base } from 'Core/Native/SensorInfo';

export type SensorInfoMock = Base & {
    stopAccelerometerUpdates: jest.Mock;
    Ios: {
        startAccelerometerUpdates: jest.Mock;
    };
};

export const SensorInfoApi = jest.fn(() => {
    return <SensorInfoMock>{
        stopAccelerometerUpdates: jest.fn(),
        Ios: {
            startAccelerometerUpdates: jest.fn().mockImplementation(() => Promise.resolve())
        }
    };
});
