import { assert } from 'chai';
import 'mocha';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
describe('VastCompanionAdStaticResource', () => {
    it('should have the correct data', () => {
        const vastCreativeCompanionAd = new VastCompanionAdStaticResource('id', 700, 800, 'image/png', 'http://image.com', 'https://url.com/companionClickThroughURLTemplate', ['https://url.com/companionClickTrackingURLTemplate1', 'https://url.com/companionClickTrackingURLTemplate2'], { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
        assert.equal(vastCreativeCompanionAd.getId(), 'id');
        assert.equal(vastCreativeCompanionAd.getCreativeType(), 'image/png');
        assert.equal(vastCreativeCompanionAd.getHeight(), 700);
        assert.equal(vastCreativeCompanionAd.getWidth(), 800);
        assert.equal(vastCreativeCompanionAd.getType(), VastCompanionAdType.STATIC);
        assert.equal(vastCreativeCompanionAd.getStaticResourceURL(), 'http://image.com');
        assert.equal(vastCreativeCompanionAd.getCompanionClickThroughURLTemplate(), 'https://url.com/companionClickThroughURLTemplate');
        assert.deepEqual(vastCreativeCompanionAd.getCompanionClickTrackingURLTemplates(), ['https://url.com/companionClickTrackingURLTemplate1', 'https://url.com/companionClickTrackingURLTemplate2']);
        assert.deepEqual(vastCreativeCompanionAd.getTrackingEvents(), { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2VUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZBU1QvVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2VUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMxRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUUzRSxRQUFRLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO0lBQzNDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFDcEMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLDZCQUE2QixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxrREFBa0QsRUFBRSxDQUFDLG9EQUFvRCxFQUFFLG9EQUFvRCxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsQ0FBQyxrREFBa0QsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvVixNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsZUFBZSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUUsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDakYsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxtQ0FBbUMsRUFBRSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7UUFDaEksTUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFLENBQUMsb0RBQW9ELEVBQUUsb0RBQW9ELENBQUMsQ0FBQyxDQUFDO1FBQ2hNLE1BQU0sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLGtEQUFrRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVJLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==