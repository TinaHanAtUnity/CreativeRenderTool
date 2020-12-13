import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('MediationMetaDataTest', () => {
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
            return metaDataManager.fetch(MediationMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned MediationMetaData even when it doesnt exist');
            });
        });
        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                mediation: {
                    name: { value: 'test_name' },
                    version: { value: 'test_version' },
                    adapter_version: { value: 'test_adapter_version' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(MediationMetaData, true, ['name', 'version', 'adapter_version']).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                    assert.equal(metaData.getAdapterVersion(), 'test_adapter_version', 'MediationMetaData.getAdapterVersion() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        mediationName: 'test_name',
                        mediationVersion: 'test_version',
                        mediationAdapterVersion: 'test_adapter_version',
                        mediationOrdinal: undefined
                    }, 'MediationMetaData.getDTO() produced invalid output');
                }
                else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });
        it('should update correctly', () => {
            backend.Api.Storage.setStorageContents({
                mediation: {
                    name: { value: 'test_name' },
                    version: { value: 'test_version' },
                    ordinal: { value: 42 }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(MediationMetaData, true, ['name', 'version']).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                    assert.equal(metaData.getOrdinal(), undefined, 'MediationMetaData.getOrdinal() did not pass through correctly');
                    return metaDataManager.fetch(MediationMetaData, true, ['ordinal']).then(metaData2 => {
                        assert.equal(metaData, metaData2, 'MediationMetaData was redefined');
                        if (metaData2) {
                            assert.equal(metaData2.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                            assert.equal(metaData2.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                            assert.equal(metaData2.getOrdinal(), 42, 'MediationMetaData.getOrdinal() did not pass through correctly');
                            assert.deepEqual(metaData2.getDTO(), {
                                mediationName: 'test_name',
                                mediationVersion: 'test_version',
                                mediationAdapterVersion: undefined,
                                mediationOrdinal: 42
                            }, 'MediationMetaData.getDTO() produced invalid output');
                        }
                        else {
                            throw new Error('MediationMetaData is not defined');
                        }
                    });
                }
                else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });
        it('should not fetch when data is undefined', () => {
            backend.Api.Storage.setStorageContents({
                mediation: {
                    name: undefined,
                    version: undefined,
                    ordinal: undefined
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(MediationMetaData).then(metaData => {
                assert.isUndefined(metaData, 'MediationMetaData is defined');
            });
        });
        it('should fetch correctly when data is partially undefined', () => {
            backend.Api.Storage.setStorageContents({
                mediation: {
                    name: { value: 'test_name' }
                }
            });
            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(MediationMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                    assert.isUndefined(metaData.getVersion(), 'MediationMetaData.getVersion() did not pass through correctly');
                    assert.isUndefined(metaData.getOrdinal(), 'MediationMetaData.getOrdinal() did not pass through correctly');
                }
                else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });
        describe('isMetaDataLoadEnabled', () => {
            it('should return true when the mediation metadata is found', () => {
                backend.Api.Storage.setStorageContents({
                    mediation: {
                        name: { value: 'test_name' },
                        enable_metadata_load: { value: true }
                    }
                });
                const metaDataManager = new MetaDataManager(core);
                return metaDataManager.fetch(MediationMetaData).then(metaData => {
                    if (metaData) {
                        assert.isTrue(metaData.isMetaDataLoadEnabled());
                    }
                    else {
                        throw new Error('MediationMetaData is not defined');
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkaWF0aW9uTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTW9kZWxzL01ldGFEYXRhL01lZGlhdGlvbk1ldGFEYXRhVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFHM0UsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJeEQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBRW5CLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDUixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1lBQ3RELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELE9BQU8s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