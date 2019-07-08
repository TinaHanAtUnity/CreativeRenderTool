import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { toAbGroup } from 'Core/Models/ABGroup';
import { Store } from 'Store/Store';
import { NullStoreManager } from 'Store/Managers/NullStoreManager';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';

describe('StoreTest', () => {
    let nativeBridge: NativeBridge;
    let core: ICore;

    describe('AppleStoreManager', () => {

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, TestFixtures.getBackend(Platform.IOS));
            core = TestFixtures.getCoreModule(nativeBridge);
        });

        it('should init with AppleStoreManager in ab group 13', () => {
            sinon.stub(core.Config, 'getAbGroup').returns(toAbGroup(13));
            const store = new Store(core);
            assert.instanceOf(store.StoreManager, AppleStoreManager);
        });

        it('should not init with AppleStoreManager', () => {
            sinon.stub(core.Config, 'getAbGroup').returns(toAbGroup(0));
            const store = new Store(core);
            assert.instanceOf(store.StoreManager, NullStoreManager);
        });

    });

    describe('GoogleStoreManager', () => {

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
            core = TestFixtures.getCoreModule(nativeBridge);
        });

        it('should init with GoogleStoreManager in ab group 13', () => {
            sinon.stub(core.Config, 'getAbGroup').returns(toAbGroup(13));
            const store = new Store(core);
            assert.instanceOf(store.StoreManager, GoogleStoreManager);
        });

        it('should not init with GoogleStoreManager', () => {
            sinon.stub(core.Config, 'getAbGroup').returns(toAbGroup(0));
            const store = new Store(core);
            assert.instanceOf(store.StoreManager, NullStoreManager);
        });
    });

});
