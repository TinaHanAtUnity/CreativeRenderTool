import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AdapterMetaDataTest', () => {
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
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned AdapterMetaData even when it doesnt exist');
            });
        });
        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                adapter: {
                    name: { value: 'test_name' },
                    version: { value: 'test_version' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'AdapterMetaData.getVersion() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        adapterName: 'test_name',
                        adapterVersion: 'test_version'
                    }, 'AdapterMetaData.getDTO() produced invalid output');
                }
                else {
                    throw new Error('AdapterMetaData is not defined');
                }
            });
        });
        it('should not fetch when data is undefined', () => {
            backend.Api.Storage.setStorageContents({
                adapter: {
                    name: undefined,
                    version: undefined
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                assert.isUndefined(metaData, 'AdapterMetaData is defined');
            });
        });
        it('should fetch correctly when data is partially undefined', () => {
            backend.Api.Storage.setStorageContents({
                adapter: {
                    name: { value: 'test_name' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
                }
                else {
                    throw new Error('AdapterMetaData is not defined');
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRhcHRlck1ldGFEYXRhVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL01vZGVscy9NZXRhRGF0YS9BZGFwdGVyTWV0YURhdGFUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFHdkUsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtRQUNqQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBRW5CLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDUixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1lBQ3RELE1BQU0sZUFBZSxHQUFvQixJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRSxPQUFPLGVBQWUs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