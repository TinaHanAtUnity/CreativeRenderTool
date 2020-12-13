import 'mocha';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';
describe('MRAIDWebViewTopCalculator', () => {
    describe('When device is Android', () => {
        let mraidViewSizer;
        beforeEach(() => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });
        it('should scale for landscape', () => {
            const width = 800;
            const height = 600;
            assert.equal(mraidViewSizer.getTopPosition(width, height), 48);
        });
        it('should scale for portrait', () => {
            const width = 600;
            const height = 800;
            assert.equal(mraidViewSizer.getTopPosition(width, height), 40);
        });
    });
    describe('When device is iPhone', () => {
        let mraidViewSizer;
        beforeEach(() => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });
        it('should scale for landscape', () => {
            const width = 800;
            const height = 600;
            assert.equal(mraidViewSizer.getTopPosition(width, height), 66);
        });
        it('should scale for portrait', () => {
            const width = 600;
            const height = 800;
            assert.equal(mraidViewSizer.getTopPosition(width, height), 48);
        });
    });
    describe('When device is iPhoneX', () => {
        let mraidViewSizer;
        beforeEach(() => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });
        it('should scale for landscape', () => {
            const width = 812;
            const height = 375;
            assert.equal(mraidViewSizer.getTopPosition(width, height), 41.25);
        });
        it('should scale for portrait', () => {
            const width = 375;
            const height = 812;
            assert.equal(Math.round(mraidViewSizer.getTopPosition(width, height)), 89);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURXZWJWaWV3VG9wQ2FsY3VsYXRvclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvTVJBSUQvVmlld3MvTVJBSURXZWJWaWV3VG9wQ2FsY3VsYXRvclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFFcEYsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtJQUN2QyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLElBQUksY0FBb0MsQ0FBQztRQUV6QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFbkQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELGNBQWMsR0FBRyxJQUFJLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDbEMsTUFBTSxLQUFL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