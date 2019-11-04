import { AndroidAdUnitApi } from 'Ads/Native/Android/__mocks__/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/__mocks__/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/__mocks__/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/__mocks__/VideoPlayer';
import { AdsPropertiesApi } from 'Ads/Native/__mocks__/AdsProperties';
import { ListenerApi } from 'Ads/Native/__mocks__/Listener';
import { PlacementApi } from 'Ads/Native/__mocks__/Placement';
import { VideoPlayerApi } from 'Ads/Native/__mocks__/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/__mocks__/WebPlayer';
import { LoadApi } from 'Core/Native/__mocks__/LoadApi';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/__mocks__/WebPlayer/InterstitialWebPlayerContainer';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { MissedImpressionManager } from 'Ads/Managers/__mocks__/MissedImpressionManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { PlacementManager } from 'Ads/Managers/__mocks__/PlacementManager';
import { AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
import { ThirdPartyEventManagerFactory } from 'Ads/Managers/__mocks__/ThirdPartyEventManagerFactory';
import { Analytics } from 'Analytics/__mocks__/Analytics';
import { Store } from 'Store/__mocks__/Store';
import { CampaignManager } from 'Ads/Managers/__mocks__/CampaignManager';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';

export const Ads = jest.fn(() => {
    return {
        Api: {
            AdsProperties: new AdsPropertiesApi(),
            Listener: new ListenerApi(),
            Placement: new PlacementApi(),
            VideoPlayer: new VideoPlayerApi(),
            WebPlayer: new WebPlayerApi(),
            Android: {
                AdUnit: new AndroidAdUnitApi(),
                VideoPlayer: new AndroidVideoPlayerApi()
            },
            iOS: {
                AdUnit: new IosAdUnitApi(),
                VideoPlayer: new IosVideoPlayerApi()
            },
            LoadApi: new LoadApi()
        },
        AdMobSignalFactory: new AdMobSignalFactory(),
        InterstitialWebPlayerContainer: new InterstitialWebPlayerContainer(),
        SessionManager: new SessionManager(),
        MissedImpressionManager: new MissedImpressionManager(),
        ContentTypeHandlerManager: new ContentTypeHandlerManager(),
        Config: new AdsConfiguration(),
        Container: new AdUnitContainer(),
        PrivacyManager: new UserPrivacyManager(),
        PlacementManager: new PlacementManager(),
        AssetManager: new AssetManager(),
        CampaignManager: new CampaignManager(),
        RefreshManager: new RefreshManager(),
        ThirdPartyEventManagerFactory: new ThirdPartyEventManagerFactory(),
        Analytics: new Analytics(),
        Store: new Store(),
        PrivacySDK: new PrivacySDK()
    };
});
