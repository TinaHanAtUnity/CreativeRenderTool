import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { Placement } from 'Ads/Models/Placement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { StorageError, StorageType } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { StorageBridgeHelper } from 'TestHelpers/StorageBridgeHelper';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('BackupCampaignManagerTest', () => {
    it('should store placement data', () => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const storageBridge: StorageBridge = new StorageBridge(core, 1);

        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, TestFixtures.getCoreConfiguration());
        const placement: Placement = TestFixtures.getPlacement();
        const testMediaId: string = '12345';

        const setSpy = sinon.spy(core.Storage, 'set');
        const writeSpy = sinon.spy(core.Storage, 'write');

        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);

        backupCampaignManager.storePlacement(placement, testMediaId);

        return storagePromise.then(() => {
            assert.equal(setSpy.callCount, 2, 'two values were not written for backup campaign placement data');

            assert.equal(setSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
            assert.equal(setSpy.getCall(0).args[1], 'backupcampaign.placement.' + placement.getId() + '.mediaid', 'incorrect key for mediaId');
            assert.equal(setSpy.getCall(0).args[2], testMediaId, 'incorrect mediaId');

            assert.equal(setSpy.getCall(1).args[0], StorageType.PRIVATE, 'data was not written to private storage');
            assert.equal(setSpy.getCall(1).args[1], 'backupcampaign.placement.' + placement.getId() + '.adtypes', 'incorrect key for adtypes');
            assert.equal(setSpy.getCall(1).args[2], '["TEST"]', 'incorrect adtype serialization');

            assert.equal(writeSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        });
    });

    it('should store performance campaign data', () => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);

        const storageBridge: StorageBridge = new StorageBridge(core, 1);

        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, TestFixtures.getCoreConfiguration());

        const campaign: PerformanceCampaign = TestFixtures.getCampaign();
        const testMediaId: string = 'beefcace-abcdefg-deadbeef';

        const setSpy = sinon.spy(core.Storage, 'set');
        const writeSpy = sinon.spy(core.Storage, 'write');

        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);

        backupCampaignManager.storeCampaign(campaign);

        return storagePromise.then(() => {
            assert.equal(setSpy.callCount, 3);
            assert.equal(writeSpy.callCount, 1);

            assert.equal(setSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
            assert.equal(setSpy.getCall(0).args[1], 'backupcampaign.campaign.' + testMediaId + '.type', 'incorrect key for campaign type');
            assert.equal(setSpy.getCall(0).args[2], 'performance', 'incorrect name for performance campaign');

            assert.equal(setSpy.getCall(1).args[0], StorageType.PRIVATE, 'data was not written to private storage');
            assert.equal(setSpy.getCall(1).args[1], 'backupcampaign.campaign.' + testMediaId + '.data', 'incorrect key for campaign data');
            assert.equal(setSpy.getCall(1).args[2], campaign.toJSON(), 'incorrect data serialization for performance campaign');

            assert.equal(setSpy.getCall(2).args[0], StorageType.PRIVATE, 'data was not written to private storage');
            assert.equal(setSpy.getCall(2).args[1], 'backupcampaign.campaign.' + testMediaId + '.willexpireat', 'incorrect key for campaign type');
            assert.isTrue(setSpy.getCall(2).args[2] > Date.now() + 6 * 24 * 3600 * 1000, 'performance campaign expiry less than 6 days in the future');
            assert.isTrue(setSpy.getCall(2).args[2] < Date.now() + 8 * 24 * 3600 * 1000, 'performance campaign expiry more than 8 days in the future');

            assert.equal(writeSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        });
    });

    it('should not store placement data when test mode is active', () => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const storageBridge: StorageBridge = new StorageBridge(core, 1);

        const configuration = TestFixtures.getCoreConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, configuration);
        const placement: Placement = TestFixtures.getPlacement();
        const testMediaId: string = '12345';

        backupCampaignManager.storePlacement(placement, testMediaId);

        assert.isTrue(storageBridge.isEmpty(), 'placement data was queued to StorageBridge when test mode is active');
    });

    it('should not store campaign data when test mode is active', () => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const storageBridge: StorageBridge = new StorageBridge(core, 1);

        const configuration = TestFixtures.getCoreConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, configuration);
        const campaign: PerformanceCampaign = TestFixtures.getCampaign();

        backupCampaignManager.storeCampaign(campaign);

        assert.isTrue(storageBridge.isEmpty(), 'campaign data was queued to StorageBridge when test mode is active');
    });

    it('should not load campaigns when test mode is active', () => {
        const configuration = TestFixtures.getCoreConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const storageBridge: StorageBridge = new StorageBridge(core, 1);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, configuration);

        return backupCampaignManager.loadCampaign(TestFixtures.getPlacement()).then(campaign => {
            assert.isUndefined(campaign, 'campaign was loaded when test mode is active');
        });
    });

    it('should not load campaign when storage is empty', () => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const storageBridge: StorageBridge = new StorageBridge(core, 1);

        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, TestFixtures.getCoreConfiguration());

        return backupCampaignManager.loadCampaign(TestFixtures.getPlacement()).then(campaign => {
            assert.isUndefined(campaign, 'campaign was loaded when storage is empty');
        });
    });

    it('should load campaign when campaign is stored and cached', () => {
        const placement: Placement = TestFixtures.getPlacement();
        const campaign: PerformanceCampaign = TestFixtures.getCampaign();
        const testMediaId: string = 'beefcace-abcdefg-deadbeef';

        const video = campaign.getVideo();
        const gameIcon = campaign.getGameIcon();
        const portrait = campaign.getPortrait();
        const landscape = campaign.getLandscape();

        if (video) {
            video.setCachedUrl('file:///video.mp4');
            video.setFileId('video.mp4');
        }

        if (gameIcon) {
            gameIcon.setCachedUrl('file:///gameicon.jpg');
            gameIcon.setFileId('gameicon.jpg');
        }

        if (portrait) {
            portrait.setCachedUrl('file:///portrait.jpg');
            portrait.setFileId('portrait.jpg');
        }

        if (landscape) {
            landscape.setCachedUrl('file:///landscape.jpg');
            landscape.setFileId('landscape.jpg');
        }

        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);

        sinon.stub(core.Storage, 'get').callsFake((type: StorageType, key: string) => {
            if (type === StorageType.PRIVATE) {
                if (key === 'backupcampaign.placement.' + placement.getId() + '.mediaid') {
                    return Promise.resolve(testMediaId);
                } else if (key === 'backupcampaign.placement.' + placement.getId() + '.adtypes') {
                    return Promise.resolve(JSON.stringify(placement.getAdTypes()));
                } else if (key === 'backupcampaign.campaign.' + testMediaId + '.type') {
                    return Promise.resolve('performance');
                } else if (key === 'backupcampaign.campaign.' + testMediaId + '.data') {
                    return Promise.resolve(campaign.toJSON());
                } else if (key === 'backupcampaign.campaign.' + testMediaId + '.willexpireat') {
                    return Promise.resolve(Date.now() + 7 * 24 * 3600 * 1000);
                }
                return Promise.reject(StorageError.COULDNT_GET_VALUE);
            }
        });
        sinon.stub(core.Cache, 'getFileInfo').returns(Promise.resolve({
            id: 'test',
            found: true,
            size: 12345,
            mtime: Date.now()
        }));

        const storageBridge: StorageBridge = new StorageBridge(core, 1);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, TestFixtures.getCoreConfiguration());

        return backupCampaignManager.loadCampaign(placement).then(loadedCampaign => {
            assert.isDefined(loadedCampaign, 'campaign was not loaded when campaign was stored and cached');
            if(loadedCampaign) {
                assert.equal(loadedCampaign.getId(), campaign.getId(), 'loaded campaign identifier does not match');
            }
        });
    });

    it('should load campaign when campaign is stored and cached files have been deleted', () => {
        const placement: Placement = TestFixtures.getPlacement();
        const campaign: PerformanceCampaign = TestFixtures.getCampaign();
        const testMediaId: string = 'beefcace-abcdefg-deadbeef';

        const video = campaign.getVideo();
        const gameIcon = campaign.getGameIcon();
        const portrait = campaign.getPortrait();
        const landscape = campaign.getLandscape();

        if(video) {
            video.setCachedUrl('file:///video.mp4');
            video.setFileId('video.mp4');
        }

        if(gameIcon) {
            gameIcon.setCachedUrl('file:///gameicon.jpg');
            gameIcon.setFileId('gameicon.jpg');
        }

        if(portrait) {
            portrait.setCachedUrl('file:///portrait.jpg');
            portrait.setFileId('portrait.jpg');
        }

        if(landscape) {
            landscape.setCachedUrl('file:///landscape.jpg');
            landscape.setFileId('landscape.jpg');
        }

        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);

        sinon.stub(core.Storage, 'get').callsFake((type: StorageType, key: string) => {
            if(type === StorageType.PRIVATE) {
                if (key === 'backupcampaign.placement.' + placement.getId() + '.mediaid') {
                    return Promise.resolve(testMediaId);
                } else if(key === 'backupcampaign.placement.' + placement.getId() + '.adtypes') {
                    return Promise.resolve(JSON.stringify(placement.getAdTypes()));
                } else if(key === 'backupcampaign.campaign.' + testMediaId + '.type') {
                    return Promise.resolve('performance');
                } else if(key === 'backupcampaign.campaign.' + testMediaId + '.data') {
                    return Promise.resolve(campaign.toJSON());
                } else if(key === 'backupcampaign.campaign.' + testMediaId + '.willexpireat') {
                    return Promise.resolve(Date.now() + 7 * 24 * 3600 * 1000);
                }
            }
            return Promise.reject(StorageError.COULDNT_GET_VALUE);
        });
        sinon.stub(core.Cache, 'getFileInfo').returns(Promise.resolve({
            found: false
        }));

        const storageBridge: StorageBridge = new StorageBridge(core, 1);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, TestFixtures.getCoreConfiguration());

        return backupCampaignManager.loadCampaign(placement).then(loadedCampaign => {
            assert.isDefined(loadedCampaign, 'campaign was not loaded when campaign was stored and cached files were deleted');
            if(loadedCampaign) {
                assert.equal(loadedCampaign.getId(), campaign.getId(), 'loaded campaign identifier does not match');

                const loadedVideo = (<PerformanceCampaign>loadedCampaign).getVideo();

                assert.isDefined(loadedVideo, 'loaded campaign video not defined');

                if(loadedVideo) {
                    assert.isUndefined(loadedVideo.getCachedUrl(), 'loaded campaign video cached url was not reset when cached video file was deleted');
                }
            }
        });
    });
});
