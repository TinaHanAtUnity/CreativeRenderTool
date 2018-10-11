import { assert } from 'chai';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { Backend } from '../../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../../src/ts/Core/Core';
import { TestFixtures } from '../../../TestHelpers/TestFixtures';
import { Platform } from '../../../../src/ts/Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PlayerMetaDataTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

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
                    server_id: {value: 'test_sid'}
                }
            });

            const metaDataManager = new MetaDataManager(core);
            return metaDataManager.fetch(PlayerMetaData, false).then(metaData => {
                if(metaData) {
                    assert.equal(metaData.getServerId(), 'test_sid', 'PlayerMetaData.getServerId() did not pass through correctly');
                    assert.deepEqual(metaData.getDTO(), {
                        sid: 'test_sid'
                    }, 'PlayerMetaData.getDTO() produced invalid output');
                    return metaDataManager.fetch(PlayerMetaData).then(exists => {
                        assert.isUndefined(exists, 'PlayerMetaData was not deleted after fetching');
                    });
                } else {
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
