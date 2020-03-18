import { ListenerApi as Base } from 'Ads/Native/Listener';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type ListenerMock = Base & {
    onPlacementStateChangedEventSent: ObservableMock;
    sendFinishEvent: jest.Mock;
    sendPlacementStateChangedEvent: jest.Mock;
};

export const ListenerApi = jest.fn(() => {
    return <ListenerMock>{
        onPlacementStateChangedEventSent: Observable(),
        sendFinishEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        sendPlacementStateChangedEvent: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
