import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('FocusManagerTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let wakeUpManager: WakeUpManager;
        let focusManager: FocusManager;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            focusManager = new FocusManager(platform, core);
            wakeUpManager = new WakeUpManager(core);
        });

        if(platform === Platform.ANDROID) {
            it('should start listening to screen broadcasts', () => {
                const spy = sinon.spy(core.Android!.Broadcast, 'addBroadcastListener');
                return focusManager.setListenScreen(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
                });
            });

            it('should stop listening to screen broadcasts', () => {
                const spy = sinon.spy(core.Android!.Broadcast, 'removeBroadcastListener');
                return focusManager.setListenScreen(false).then(() => {
                    sinon.assert.calledOnce(spy);
                });
            });
        }

        if(platform === Platform.IOS) {
            it('should start listening to app foreground events', () => {
                const spy = sinon.spy(core.iOS!.Notification, 'addNotificationObserver');
                return focusManager.setListenAppForeground(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                    assert.deepEqual(spy.getCall(0).args[1], []);
                });
            });

            it('should stop listening to app foreground events', () => {
                const spy = sinon.spy(core.iOS!.Notification, 'removeNotificationObserver');
                return focusManager.setListenAppForeground(false).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                });
            });

            it('should start listening to app background events', () => {
                const spy = sinon.spy(core.iOS!.Notification, 'addNotificationObserver');
                return focusManager.setListenAppBackground(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                    assert.deepEqual(spy.getCall(0).args[1], []);
                });
            });

            it('should stop listening to app background events', () => {
                const spy = sinon.spy(core.iOS!.Notification, 'removeNotificationObserver');
                return focusManager.setListenAppBackground(false).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                });
            });
        }

        if(platform === Platform.ANDROID) {
            it('should start listening to Android lifecycle events', () => {
                const spy = sinon.spy(core.Android!.Lifecycle, 'register');
                return focusManager.setListenAndroidLifecycle(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], ['onActivityResumed', 'onActivityPaused']);
                });
            });

            it('should stop listening to Android lifecycle events', () => {
                const spy = sinon.spy(core.Android!.Lifecycle, 'unregister');
                return focusManager.setListenAndroidLifecycle(false).then(() => {
                    sinon.assert.calledOnce(spy);
                });
            });
        }

        it('should trigger onNetworkConnected', () => {
            const spy = sinon.spy();
            wakeUpManager.onNetworkConnected.subscribe(spy);

            core.Connectivity.handleEvent('CONNECTED', [true, 0]);
            sinon.assert.callCount(spy, 1);
        });

        it('should throttle onNetworkConnected to 10 events', () => {
            const spy = sinon.spy();
            wakeUpManager.onNetworkConnected.subscribe(spy);

            for(let i: number = 0; i < 20; i++) {
                core.Connectivity.handleEvent('CONNECTED', [true, 0]);
            }

            sinon.assert.callCount(spy, 10);
        });

        if(platform === Platform.ANDROID) {
            it('should trigger onScreenOn', () => {
                const spy = sinon.spy();
                focusManager.onScreenOn.subscribe(spy);

                core.Android!.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
                sinon.assert.calledOnce(spy);
            });

            it('should trigger onScreenOff', () => {
                const spy = sinon.spy();
                focusManager.onScreenOff.subscribe(spy);

                core.Android!.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
                sinon.assert.calledOnce(spy);
            });
        }

        if(platform === Platform.IOS) {
            it('should trigger onAppForeground', () => {
                const spy = sinon.spy();
                focusManager.onAppForeground.subscribe(spy);

                core.iOS!.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                sinon.assert.calledOnce(spy);
            });

            it('should trigger onAppBackground', () => {
                const spy = sinon.spy();
                focusManager.onAppBackground.subscribe(spy);

                core.iOS!.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                sinon.assert.calledOnce(spy);
            });
        }

        if(platform === Platform.ANDROID) {
            it('should trigger onActivityResumed', () => {
                const spy = sinon.spy();
                focusManager.onActivityResumed.subscribe(spy);

                core.Android!.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                sinon.assert.calledOnce(spy);
            });

            it('should trigger onActivityPaused', () => {
                const spy = sinon.spy();
                focusManager.onActivityPaused.subscribe(spy);

                core.Android!.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                sinon.assert.calledOnce(spy);
            });
        }

        it('should handle app foreground status when initialized', () => {
            assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after FocusManager was initialized');
        });

        if(platform === Platform.IOS) {
            it('should handle app foreground status after going to background (on iOS)', () => {
                core.iOS!.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on iOS)');
            });

            it('should handle app foreground status after returning to foreground (on iOS)', () => {
                core.iOS!.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                core.iOS!.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on iOS)');
            });
        }

        if(platform === Platform.ANDROID) {
            it('should handle app foreground status after going to background (on Android)', () => {
                core.Android!.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on Android)');
            });

            it('should handle app foreground status after returning to foreground (on Android)', () => {
                core.Android!.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                core.Android!.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on Android)');
            });

            it('should handle app foreground status when changing Android activities', () => {
                core.Android!.Lifecycle.handleEvent('RESUMED', ['com.test.newactivity']);
                core.Android!.Lifecycle.handleEvent('PAUSED', ['com.test.oldactivity']);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after changing Android activities');
            });
        }
    });
});
