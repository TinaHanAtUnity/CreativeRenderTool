import { assert } from 'chai';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { ICoreApi } from '../../../../src/ts/Core/ICore';
import { Backend } from '../../../../src/ts/Backend/Backend';
import { TestFixtures } from '../../../TestHelpers/TestFixtures';
import { Platform } from '../../../../src/ts/Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AdapterMetaDataTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

        before(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });

        it('should return undefined when data doesnt exist', () => {
            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned AdapterMetaData even when it doesnt exist');
            });
        });

        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                adapter: {
                    name: {value: 'test_name'},
                    version: {value: 'test_version'}
                }
            });

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                if(metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'AdapterMetaData.getVersion() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        adapterName: 'test_name',
                        adapterVersion: 'test_version'
                    }, 'AdapterMetaData.getDTO() produced invalid output');
                } else {
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

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                assert.isUndefined(metaData, 'AdapterMetaData is defined');
            });
        });

        it('should fetch correctly when data is partially undefined', () => {
            backend.Api.Storage.setStorageContents({
                adapter: {
                    name: {value: 'test_name'}
                }
            });

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(AdapterMetaData).then(metaData => {
                if(metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
                } else {
                    throw new Error('AdapterMetaData is not defined');
                }
            });
        });
    });
});
