import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PlayerMetaDataTest', () => {
        let backend;
        let nativeBridge;
        let core;
        before(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });
        it('should return undefined when data does not exist', () => {
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(PlayerMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned PlayerMetaData even when it does not exist');
            });
        });
        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                player: {
                    server_id: { value: 'test_sid' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(PlayerMetaData, false).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getServerId(), 'test_sid', 'PlayerMetaData.getServerId() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        sid: 'test_sid'
                    }, 'PlayerMetaData.getDTO() produced invalid output');
                    return metaDataManager.fetch(PlayerMetaData).then(exists => {
                        assert.isUndefined(exists, 'PlayerMetaData was not deleted after fetching');
                    });
                }
                else {
                    throw new Error('PlayerMetaData is not defined');
                }
            });
        });
        it('should not fetch when data is undefined', () => {
            backend.Api.Storage.setStorageContents({
                player: {
                    server_id: undefined
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(PlayerMetaData).then(metaData => {
                assert.isUndefined(metaData, 'PlayerMetaData is not defined');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTW9kZWxzL01ldGFEYXRhL1BsYXllck1ldGFEYXRhVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBR3JFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLElBQWMsQ0FBQztRQUVuQixNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1IsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtEQUFrRCxFQUFFLEdBQUcsRUFBRTtZQUN4RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxxREFBcUQsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFNO2dCQUN4QyxNQUFNLEVBQUU7b0JBQ0osU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtpQkFDbkM7YUFDSixDQUFDLENBQUM7WUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDaEUsSUFBSSxRQUFRLEVBQUU7b0JBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLDZEQUE2RCxDQUFDLENBQUM7b0JBQ2hILE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNoQyxHQUFHLEVBQUUsVUFBVTtxQkFDbEIsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO29CQUN0RCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN2RCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSwrQ0FBK0MsQ0FBQyxDQUFDO29CQUNoRixDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTtvQkFDSCxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7aUJBQ3BEO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLEVBQUU7WUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQU07Z0JBQ3hDLE1BQU0sRUFBRTtvQkFDSixTQUFTLEVBQUUsU0FBUztpQkFDdkI7YUFDSixDQUFDLENBQUM7WUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=