import { assert } from 'chai';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { Backend } from '../../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../../src/ts/Core/ICore';
import { TestFixtures } from '../../../TestHelpers/TestFixtures';
import { Platform } from '../../../../src/ts/Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('FrameworkMetaDataTest', () => {
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
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                assert.isUndefined(metaData, 'Returned FrameworkMetaData even when it doesnt exist');
            });
        });

        it('should fetch correctly', () => {
            backend.Api.Storage.setStorageContents({
                framework: {
                    name: {value: 'test_name'},
                    version: {value: 'test_version'}
                }
            });

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                if(metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), 'test_version', 'FrameworkMetaData.getVersion() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        frameworkName: 'test_name',
                        frameworkVersion: 'test_version'
                    }, 'FrameworkMetaData.getDTO() produced invalid output');
                } else {
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

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                assert.isUndefined(metaData, 'FrameworkMetaData is defined');
            });
        });

        it('should fetch correctly when data is partially undefined', () => {
            backend.Api.Storage.setStorageContents({
                framework: {
                    name: {value: 'test_name'}
                }
            });

            const metaDataManager: MetaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(FrameworkMetaData).then(metaData => {
                if(metaData) {
                    assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                    assert.equal(metaData.getVersion(), undefined, 'FrameworkMetaData.getVersion() did not pass through correctly');
                } else {
                    throw new Error('FrameworkMetaData is not defined');
                }
            });
        });
    });
});
