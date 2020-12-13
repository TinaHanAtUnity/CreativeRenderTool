import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
describe('BannerAdUnitParameterFactory', () => {
    let core;
    let ads;
    let bannerModule;
    let factory;
    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        bannerModule = TestFixtures.getBannerModule(ads, core);
        factory = new BannerAdUnitParametersFactory(bannerModule, ads, core);
    });
    it('should create thirdPartyManager with the correct template values', () => {
        const placement = sinon.createStubInstance(Placement);
        placement.getId.returns('1');
        const campaign = sinon.createStubInstance(BannerCampaign);
        const sdkVersion = core.ClientInfo.getSdkVersion().toString();
        const webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        return factory.create('test', campaign, placement, webPlayerContainer).then((params) => {
            assert.deepEqual(params.thirdPartyEventManager._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': sdkVersion
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnlUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Jhbm5lcnMvQWRVbml0cy9CYW5uZXJBZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQzlGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFakQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUVoRixRQUFRLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO0lBRTFDLElBQUksSUFBVyxDQUFDO0lBQ2hCLElBQUksR0FBUyxDQUFDO0lBQ2QsSUFBSSxZQUEyQixDQUFDO0lBRWhDLElBQUksT0FBc0MsQ0FBQztJQUUzQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0csSUFBSSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEQsR0FBRyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZELE9BQU8sR0FBRyxJQUFJLDZCQUE2QixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsa0VBQWtFLEVBQUUsR0FBRyxFQUFFO1FBQ3hFLE1BQU0sU0FBUyxHQUFjLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxTQUFTLENBQUMsS0FBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxNQUFNLFFBQVEsR0FBbUIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUQsTUFBTSxrQkFBa0IsR0FBdUIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDNUYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDbkYsTUFBTSxDQUFDLFNBQVMsQ0FBTyxNQUFNLENBQUMsc0JBQXVCLENBQUMsZUFBZSxFQUFFO2dCQUNuRSxRQUFRLEVBQUUsR0FBRztnQkFDYixlQUFlLEVBQUUsVUFBVTthQUM5QixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==