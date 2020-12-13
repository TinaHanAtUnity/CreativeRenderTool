import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { MetaData } from 'Core/Utilities/MetaData';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PrivacyEnvironmentTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let metaData;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            metaData = new MetaData(core);
            sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['testValue']));
            sinon.stub(metaData, 'get')
                .withArgs('privacytest.testValue').returns(Promise.resolve([true, 1234]));
        });
        it('should get defined value', () => {
            return PrivacyTestEnvironment.setup(metaData).then(() => {
                assert.equal(1234, PrivacyTestEnvironment.get('testValue'), 'privacy environment metadata number does not match');
            });
        });
        it('should not get undefined vaue', () => {
            return PrivacyTestEnvironment.setup(metaData).then(() => {
                assert.isUndefined(PrivacyTestEnvironment.get('undefinedTestValue'), 'undefined privacy environment metadata found');
            });
        });
        it('defined value should be set', () => {
            return PrivacyTestEnvironment.setup(metaData).then(() => {
                assert.isTrue(PrivacyTestEnvironment.isSet('testValue'), 'isSet should return true for defined value');
            });
        });
        it('undefined value should be set', () => {
            return PrivacyTestEnvironment.setup(metaData).then(() => {
                assert.isFalse(PrivacyTestEnvironment.isSet('undefinedTestValue'), 'isSet should return false for undefined value');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVRlc3RFbnZpcm9ubWVudFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUHJpdmFjeS9Qcml2YWN5VGVzdEVudmlyb25tZW50VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUNwQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksUUFBa0IsQ0FBQztRQUV2QixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU5QixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7aUJBQ3RCLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDaEMsT0FBTyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDcEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLG9EQUFvRCxDQUFDLENBQUM7WUFDdEgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7WUFDckMsT0FBTyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDcEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ3pILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUUsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE9BQU8sc0JBQXNCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLDRDQUE0QyxDQUFDLENBQUM7WUFDM0csQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBRSwrQkFBK0IsRUFBRSxHQUFHLEVBQUU7WUFDdEMsT0FBTyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDcEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsRUFBRSwrQ0FBK0MsQ0FBQyxDQUFDO1lBQ3hILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=