import { BroadcastApi as Base } from 'Core/Native/Android/Broadcast';

export type BroadcastApiMock = Base & {
};

export const BroadcastApi = jest.fn(() => {
    return <BroadcastApiMock>{
    };
});
