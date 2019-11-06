import { ICore } from 'Core/ICore';
import { SensorInfoApi } from 'Core/Native/__mocks__/SensorInfo';

export const Core = jest.fn(() => {
    return <ICore><unknown>{
        Api: {
            SensorInfo: new SensorInfoApi()
        }
    };
});
