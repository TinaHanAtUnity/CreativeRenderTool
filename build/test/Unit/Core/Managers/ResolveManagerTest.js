import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ResolveManager } from 'Core/Managers/ResolveManager';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ResolveTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let resolve;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            resolve = new ResolveManager(core);
        });
        it('Resolve host with success', () => {
            const testHost = 'www.example.net';
            const testIp = '1.2.3.4';
            return resolve.resolve(testHost).then(([id, host, ip]) => {
                assert.equal(testHost, host, 'Hostname does not match the request');
                assert.equal(testIp, ip, 'IP address was not successfully resolved');
            });
        });
        it('Resolve host with failure', () => {
            const failHost = 'www.fail.com';
            const expectedError = 'Error';
            const expectedErrorMsg = 'Error message';
            return resolve.resolve(failHost).then(() => {
                assert.fail('Failed resolve must not be successful');
            }, ([error, errorMsg]) => {
                assert.equal(expectedError, error, 'Failed resolve error does not match');
                assert.equal(expectedErrorMsg, errorMsg, 'Failed resolve error message does not match');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZU1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTWFuYWdlcnMvUmVzb2x2ZU1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUN6QixJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksT0FBdUIsQ0FBQztRQUU1QixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDakMsTUFBTSxRQUFRLEdBQVcsaUJBQWlCLENBQUM7WUFDM0MsTUFBTSxNQUFNLEdBQVcsU0FBUyxDQUFDO1lBRWpDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7Z0JBQ3BFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ2pDLE1BQU0sUUFBUSxHQUFXLGNBQWMsQ0FBQztZQUN4QyxNQUFNLGFBQWEsR0FBVyxPQUFPLENBQUM7WUFDdEMsTUFBTSxnQkFBZ0IsR0FBVyxlQUFlLENBQUM7WUFFakQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN6RCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFO2dCQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUscUNBQXFDLENBQUMsQ0FBQztnQkFDMUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztZQUM1RixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9