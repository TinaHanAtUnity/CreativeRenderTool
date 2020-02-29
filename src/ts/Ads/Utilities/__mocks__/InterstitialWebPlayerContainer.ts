import { InterstitialWebPlayerContainer as Base} from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import {Observable, ObservableMock} from 'Core/Utilities/__mocks__/Observable';

export type InterstitialWebPlayerContainerMock = Base & {
    setUrl: jest.Mock;
    setData: jest.Mock;
    setSettings: jest.Mock;
    setEventSettings: jest.Mock;
    sendEvent: jest.Mock;
    onCreateWebView: ObservableMock;
    shouldOverrideUrlLoading: ObservableMock;
};

export const InterstitialWebPlayerContainer = jest.fn(() => {
    return <InterstitialWebPlayerContainerMock>{
        setUrl: jest.fn().mockImplementation(() => Promise.resolve()),
        setData: jest.fn().mockImplementation(() => Promise.resolve()),
        setSettings: jest.fn().mockImplementation(() => Promise.resolve()),
        setEventSettings: jest.fn().mockImplementation(() => Promise.resolve()),
        sendEvent: jest.fn().mockImplementation(() => Promise.resolve()),
        onCreateWebView: new Observable(),
        shouldOverrideUrlLoading: new Observable()
    };
});
