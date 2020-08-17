import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { CampaignManager } from 'Ads/Managers/__mocks__/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { MissedImpressionManager } from 'Ads/Managers/__mocks__/MissedImpressionManager';
import { PlacementManager } from 'Ads/Managers/__mocks__/PlacementManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { ThirdPartyEventManagerFactory } from 'Ads/Managers/__mocks__/ThirdPartyEventManagerFactory';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AndroidAdUnitApi } from 'Ads/Native/Android/__mocks__/AndroidAdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/__mocks__/AndroidVideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/__mocks__/iOSAdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/__mocks__/iOSVideoPlayer';
import { AdsPropertiesApi } from 'Ads/Native/__mocks__/AdsProperties';
import { ListenerApi } from 'Ads/Native/__mocks__/Listener';
import { PlacementApi } from 'Ads/Native/__mocks__/PlacementApi';
import { VideoPlayerApi } from 'Ads/Native/__mocks__/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/__mocks__/WebPlayer';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/__mocks__/InterstitialWebPlayerContainer';
import { Analytics } from 'Analytics/__mocks__/Analytics';
import { LoadApi } from 'Core/Native/__mocks__/LoadApi';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Store } from 'Store/__mocks__/Store';
import { LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';

import { IAds } from 'Ads/IAds';

export const Ads = jest.fn(() => {
    return <IAds>{
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
        PrivacySDK: new PrivacySDK(),
        LoadAndFillEventManager: new LoadAndFillEventManager()
    };
});
