import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import * as sinon from 'sinon';
import { StorageType } from 'Core/Native/Storage';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('MediationMetaDataTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

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
            backend.Api.Storage.setStorageContents(<any>{
                mediation: {
                    name: {value: 'test_name'},
                    version: {value: 'test_version'},
                    adapter_version: {value: 'test_adapter_version'}
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
                } else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });

        it('should update correctly', () => {
            backend.Api.Storage.setStorageContents(<any>{
                mediation: {
                    name: {value: 'test_name'},
                    version: {value: 'test_version'},
                    ordinal: {value: 42}
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
                        } else {
                            throw new Error('MediationMetaData is not defined');
                        }
                    });
                } else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });

        it('should not fetch when data is undefined', () => {
            backend.Api.Storage.setStorageContents(<any>{
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
            backend.Api.Storage.setStorageContents(<any>{
                mediation: {
                    name: {value: 'test_name'}
                }
            });

            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(MediationMetaData).then(metaData => {
                if (metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                    assert.isUndefined(metaData.getVersion(), 'MediationMetaData.getVersion() did not pass through correctly');
                    assert.isUndefined(metaData.getOrdinal(), 'MediationMetaData.getOrdinal() did not pass through correctly');
                } else {
                    throw new Error('MediationMetaData is not defined');
                }
            });
        });

        describe('isMetaDataLoadEnabled', () => {
            it('should return true when the mediation metadata is found', () => {
                backend.Api.Storage.setStorageContents(<any>{
                    mediation: {
                        name: {value: 'test_name'},
                        enable_metadata_load: {value: true}
                    }
                });

                const metaDataManager = new MetaDataManager(core);
                return metaDataManager.fetch(MediationMetaData).then(metaData => {
                    if (metaData) {
                        assert.isTrue(metaData.isMetaDataLoadEnabled());
                    } else {
                        throw new Error('MediationMetaData is not defined');
                    }
                });
            });
        });
    });
});
