import { VastAdUnit as Base } from 'VAST/AdUnits/VastAdUnit';
import { VastEndScreen } from 'VAST/Views/__mocks__/VastEndScreen';
import { AbstractVideoOverlay } from 'Ads/Views/__mocks__/AbstractVideoOverlay';

export type VastAdUnitMock = Base & {
    getEndScreen: jest.Mock;
    getOverlay: jest.Mock;
    getVideoClickThroughURL: jest.Mock<string | null>;
    getCompanionClickThroughUrl: jest.Mock<string | null>;
    hasImpressionOccurred: jest.Mock<boolean>;
    sendTrackingEvent: jest.Mock;
    getOpenMeasurementController: jest.Mock;
    isShowing: jest.Mock;
    canPlayVideo: jest.Mock;
    canShowVideo: jest.Mock;
    setVideoState: jest.Mock;
};

export const VastAdUnit = jest.fn(() => {
    return <VastAdUnitMock>{
        getEndScreen: jest.fn().mockReturnValue(new VastEndScreen()),
        getVideoClickThroughURL: jest.fn().mockReturnValue(null),
        getCompanionClickThroughUrl: jest.fn().mockReturnValue(null),
        hasImpressionOccurred: jest.fn().mockReturnValue(true),
        sendTrackingEvent: jest.fn(),
        getOverlay: jest.fn().mockReturnValue(new AbstractVideoOverlay()),
        getOpenMeasurementController: jest.fn(),
        isShowing: jest.fn().mockReturnValue(true),
        canPlayVideo: jest.fn().mockReturnValue(true),
        canShowVideo: jest.fn().mockReturnValue(true),
        setVideoState: jest.fn()
    };
});
