import { NativeErrorApi as Base } from 'Core/Api/NativeErrorApi';

export type NativeErrorApiMock = Base & {
};

export const NativeErrorApi = jest.fn(() => {
    return <NativeErrorApiMock>{
    };
});
