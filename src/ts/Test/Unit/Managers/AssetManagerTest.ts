import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { AssetManager } from 'Managers/AssetManager';
import { Cache } from 'Utilities/Cache';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CacheMode } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

class TestCampaign extends Campaign {

    private _required: Asset[];
    private _optional: Asset[];

    constructor(required: Asset[], optional: Asset[]) {
        super('campaignId', 'gamerId', 10);
        this._required = required;
        this._optional = optional;
    }

    public getRequiredAssets() {
        return this._required;
    }

    public getOptionalAssets() {
        return this._optional;
    }
}

describe('AssetManagerTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
    });

    it('should not cache anything when cache mode is disabled', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.DISABLED);
        const campaign = new TestCampaign([], []);
        const spy = sinon.spy(cache, 'cache');
        assetManager.setup(campaign);
        assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
    });

});
