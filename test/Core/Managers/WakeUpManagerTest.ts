import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/ICore';
import { TestFixtures } from '../../TestHelpers/TestFixtures';
import { Platform } from '../../../src/ts/Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('WakeUpManagerTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let wakeUpManager: WakeUpManager;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
        });

        it('should set connection listening status true', () => {
            const spy = sinon.spy(core.Connectivity, 'setListeningStatus');
            return wakeUpManager.setListenConnectivity(true).then(() => {
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, true);
            });
        });

        it('should set connection listening status false', () => {
            const spy = sinon.spy(core.Connectivity, 'setListeningStatus');
            return wakeUpManager.setListenConnectivity(false).then(() => {
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, false);
            });
        });
    });
});
