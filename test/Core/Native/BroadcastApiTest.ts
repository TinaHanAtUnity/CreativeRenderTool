import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from '../../TestHelpers/TestFixtures';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/Core';

describe('BroadcastApi', () => {
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
    });

    it('should handle SCREEN_ON event', () => {
        const spy = sinon.spy();
        core.Android!.Broadcast.onBroadcastAction.subscribe(spy);
        core.Android!.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledWith(spy, 'screenListener', 'android.intent.action.SCREEN_ON', '', {});
    });

    it('should throw on invalid events', () => {
        assert.throws(() => {
            core.Android!.Broadcast.handleEvent('INVALID', []);
        });
    });
});
