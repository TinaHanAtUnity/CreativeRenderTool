import { VideoAdUnitPopupEventHandler as Base } from 'Ads/EventHandlers/VideoAdUnitPopupEventHandler';
import { Campaign } from 'Ads/Models/Campaign';

export type VideoAdUnitPopupEventHandlerMock<T extends Campaign> = Base<T> & {
    onPopupShow: jest.Mock;
    onPopupClosed: jest.Mock;
    onPopupVisible: jest.Mock;
};

export const VideoAdUnitPopupEventHandler = jest.fn(() => {
    return <VideoAdUnitPopupEventHandlerMock<Campaign>> {
        onPopupShow: jest.fn(),
        onPopupClosed: jest.fn(),
        onPopupVisible: jest.fn()
    };
});
