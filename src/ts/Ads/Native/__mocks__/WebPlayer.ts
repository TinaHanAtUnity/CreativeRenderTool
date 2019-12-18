import { WebPlayerApi as Base } from 'Ads/Native/WebPlayer';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type WebPlayerApiMock = Base & {
    onPageStarted: ObservableMock;
    onPageFinished: ObservableMock;
    onWebPlayerEvent: ObservableMock;
    onCreateWindow: ObservableMock;
    shouldOverrideUrlLoading: ObservableMock;
    onCreateWebView: ObservableMock;
    onFrameUpdate: ObservableMock;
    onGetFrameResponse: ObservableMock;
    setUrl: jest.Mock;
    setData: jest.Mock;
    setDataWithUrl: jest.Mock;
    setSettings: jest.Mock;
    clearSettings: jest.Mock;
    setEventSettings: jest.Mock;
    sendEvent: jest.Mock;
    getFrame: jest.Mock;
    handleEvent: jest.Mock;
};

export const WebPlayerApi = jest.fn(() => {
    return <WebPlayerApiMock>{
        onPageStarted: Observable(),
        onPageFinished: Observable(),
        onWebPlayerEvent: Observable(),
        onCreateWindow: Observable(),
        shouldOverrideUrlLoading: Observable(),
        onCreateWebView: Observable(),
        onFrameUpdate: Observable(),
        onGetFrameResponse: Observable(),
        setUrl: jest.fn(),
        setData: jest.fn(),
        setDataWithUrl: jest.fn(),
        setSettings: jest.fn(),
        clearSettings: jest.fn(),
        setEventSettings: jest.fn(),
        sendEvent: jest.fn(),
        getFrame: jest.fn(),
        handleEvent: jest.fn()
    };
});
