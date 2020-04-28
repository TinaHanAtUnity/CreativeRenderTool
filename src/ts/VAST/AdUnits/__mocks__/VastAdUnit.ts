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
};
export const VastAdUnitWithClickThroughURL = jest.fn(() => {
    return <VastAdUnitMock>{
        getEndScreen: jest.fn().mockImplementation(() => new VastEndScreen()),
        getVideoClickThroughURL: jest.fn().mockImplementation(() => 'https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}'),
        getCompanionClickThroughUrl: jest.fn().mockImplementation(() => null),
        hasImpressionOccurred: jest.fn().mockImplementation(() => true),
        sendTrackingEvent: jest.fn(),
        getOverlay: jest.fn().mockImplementation(() => new AbstractVideoOverlay()),
        getOpenMeasurementController: jest.fn()
    };
});
export const VastAdUnitWithoutClickThroughURL = jest.fn(() => {
    return <VastAdUnitMock>{
        getEndScreen: jest.fn().mockImplementation(() => new VastEndScreen()),
        getVideoClickThroughURL: jest.fn().mockImplementation(() => null),
        getCompanionClickThroughUrl: jest.fn().mockImplementation(() => null),
        hasImpressionOccurred: jest.fn().mockImplementation(() => true),
        sendTrackingEvent: jest.fn(),
        getOverlay: jest.fn().mockImplementation(() => new AbstractVideoOverlay()),
        getOpenMeasurementController: jest.fn()
    };
});
