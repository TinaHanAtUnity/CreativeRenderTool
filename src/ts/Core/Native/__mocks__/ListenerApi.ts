import { ListenerApi as Base } from 'Core/Native/Listener';

export type ListenerApiMock = Base & {
    sendPlacementStateChangedEvent: jest.Mock;
};

export const ListenerApi = jest.fn(() => {
    return <ListenerApiMock>{
        sendPlacementStateChangedEvent: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
