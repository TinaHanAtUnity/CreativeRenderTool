import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('FrameworkMetaDataTest', () => {
        let backend;
        let nativeBridge;
        let core;
        before(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });
        it('should return undefined when data doesnt exist', () => {
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned FrameworkMetaData even when it doesnt exist');
            });
        });
        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                framework: {
                    name: { value: 'test_name' },
                    version: { value: 'test_version' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'FrameworkMetaData.getVersion() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        frameworkName: 'test_name',
                        frameworkVersion: 'test_version'
                    }, 'FrameworkMetaData.getDTO() produced invalid output');
                }
                else {
                    throw new Error('FrameworkMetaData is not defined');
                }
            });
        });
        it('should not fetch when data is undefined', () => {
            backend.Api.Storage.setStorageContents({
                framework: {
                    name: undefined,
                    version: undefined
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                assert.isUndefined(metaData, 'FrameworkMetaData is defined');
            });
        });
        it('should fetch correctly when data is partially undefined', () => {
            backend.Api.Storage.setStorageContents({
                framework: {
                    name: { value: 'test_name' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), undefined, 'FrameworkMetaData.getVersion() did not pass through correctly');
                }
                else {
                    throw new Error('FrameworkMetaData is not defined');
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhbWV3b3JrTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTW9kZWxzL01ldGFEYXRhL0ZyYW1ld29ya01ldGFEYXRhVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFHM0UsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBRW5CLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDUixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1lBQ3RELE1BQU0sZUFBZSxHQUFvQixJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRSxPQUFP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