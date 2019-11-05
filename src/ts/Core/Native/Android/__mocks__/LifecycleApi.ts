import { LifecycleApi as Base } from 'Core/Native/Android/Lifecycle';

export type LifecycleApiMock = Base & {
};

export const LifecycleApi = jest.fn(() => {
    return <LifecycleApiMock>{
    };
});
