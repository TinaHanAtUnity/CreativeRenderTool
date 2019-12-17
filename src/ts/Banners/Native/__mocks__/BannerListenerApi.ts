import { BannerListenerApi as Base } from 'Banners/Native/BannerListenerApi';

export type BannerListenerApiMock = Base & {
    sendLoadEvent: jest.Mock;
    sendClickEvent: jest.Mock;
    sendLeaveApplicationEvent: jest.Mock;
    sendErrorEvent: jest.Mock;
};

export const BannerListenerApi = jest.fn(() => {
    return <BannerListenerApiMock>{
        sendLoadEvent: jest.fn(),
        sendClickEvent: jest.fn(),
        sendLeaveApplicationEvent: jest.fn(),
        sendErrorEvent: jest.fn()
    };
});
