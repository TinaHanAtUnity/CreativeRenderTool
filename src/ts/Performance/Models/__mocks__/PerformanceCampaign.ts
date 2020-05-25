import { PerformanceCampaign as Base, StoreName } from 'Performance/Models/PerformanceCampaign';
import { Image } from 'Ads/Models/Assets/Image';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Session, SessionMock } from 'Ads/Models/__mocks__/Session';

export type PerformanceCampaignMock = Base & {
    getGameName: jest.Mock<string>;
    getGameIcon: jest.Mock<Image>;
    getId: jest.Mock<string>;
    getLandscape: jest.Mock<Image>;
    getPortrait: jest.Mock<Image>;
    getSquare: jest.Mock<Image>;
    getEndScreen: jest.Mock<HTML>;
    getClickAttributionUrl: jest.Mock<string>;
    getClickAttributionUrlFollowsRedirects: jest.Mock<string>;
    getBypassAppSheet: jest.Mock<boolean>;
    getAppStoreId: jest.Mock<string>;
    getStore: jest.Mock<StoreName>;
    getAppDownloadUrl: jest.Mock<string>;
    getSession: jest.Mock<SessionMock>;
    getRating: jest.Mock<number>;
    getRatingCount: jest.Mock<number>;
};

export const PerformanceCampaign = jest.fn(() => {
    return <PerformanceCampaignMock> {
        getGameName: jest.fn(() => 'GameName'),
        getId: jest.fn(() => 'abc123'),
        getLandscape: jest.fn().mockImplementation(() => undefined),
        getPortrait: jest.fn().mockImplementation(() => undefined),
        getSquare: jest.fn().mockImplementation(() => undefined),
        getEndScreen: jest.fn().mockImplementation(() => undefined),
        getGameIcon: jest.fn().mockImplementation(() => undefined),
        getClickAttributionUrl: jest.fn().mockImplementation(() => ''),
        getClickAttributionUrlFollowsRedirects: jest.fn().mockImplementation(() => ''),
        getBypassAppSheet: jest.fn().mockImplementation(() => false),
        getAppStoreId: jest.fn().mockImplementation(() => ''),
        getStore: jest.fn().mockImplementation(() => StoreName.APPLE),
        getAppDownloadUrl: jest.fn().mockImplementation(() => ''),
        getSession: jest.fn().mockImplementation(() => new Session()),
        getRating: jest.fn(() => 5),
        getRatingCount: jest.fn(() => 50000)
    };
});

export const PerformanceCampaignWithImages = jest.fn(() => {
    return <PerformanceCampaignMock> {
        getGameName: jest.fn(() => 'GameName'),
        getId: jest.fn(() => 'abc123'),
        getLandscape: jest.fn().mockImplementation(() => new Image('http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png', new Session())),
        getPortrait: jest.fn().mockImplementation(() => new Image('http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png', new Session())),
        getSquare: jest.fn().mockImplementation(() => new Image('http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png', new Session())),
        getEndScreen: jest.fn().mockImplementation(() => undefined),
        getGameIcon: jest.fn().mockImplementation(() => undefined),
        getClickAttributionUrl: jest.fn().mockImplementation(() => ''),
        getClickAttributionUrlFollowsRedirects: jest.fn().mockImplementation(() => ''),
        getBypassAppSheet: jest.fn().mockImplementation(() => false),
        getAppStoreId: jest.fn().mockImplementation(() => ''),
        getStore: jest.fn().mockImplementation(() => StoreName.APPLE),
        getAppDownloadUrl: jest.fn().mockImplementation(() => ''),
        getSession: jest.fn().mockImplementation(() => new Session()),
        getRating: jest.fn(() => 5),
        getRatingCount: jest.fn(() => 50000)
    };
});
