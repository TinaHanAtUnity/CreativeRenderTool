import { IMRAIDEventBridgeHandler } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';

export const MRAIDEventBridge = jest.fn(() => {
    return <IMRAIDEventBridgeHandler>{
        onClose: jest.fn(),
        onLoaded: jest.fn(),
        onOpen: jest.fn(),
        onReady: jest.fn()
    };
});
