import { ListenerApi as Base } from 'Ads/Native/Listener';

export type ListenerMock = Base & {
    sendFinishEvent: jest.Mock;
};

export const ListenerApi = jest.fn(() => {
    return <ListenerMock>{
        sendFinishEvent: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
