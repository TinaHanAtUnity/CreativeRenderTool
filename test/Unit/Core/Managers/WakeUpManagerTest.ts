import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

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
