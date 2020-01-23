import { ListenerApi as Base } from 'Ads/Native/Listener';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type ListenerMock = Base & {
    sendFinishEvent: jest.Mock;
    onPlacementStateChangedEventSent: ObservableMock;
};

export const ListenerApi = jest.fn(() => {
    return <ListenerMock>{
        sendFinishEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        onPlacementStateChangedEventSent: Observable()
    };
});
