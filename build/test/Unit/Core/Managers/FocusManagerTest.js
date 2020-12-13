import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('FocusManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let wakeUpManager;
        let focusManager;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            focusManager = new FocusManager(platform, core);
            wakeUpManager = new WakeUpManager(core);
        });
        if (platform === Platform.ANDROID) {
            it('should start listening to screen broadcasts', () => {
                const spy = sinon.spy(core.Android.Broadcast, 'addBroadcastListener');
                return focusManager.setListenScreen(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON']);
                });
            });
            it('should stop listening to screen broadcasts', () => {
                const spy = sinon.spy(core.Android.Broadcast, 'removeBroadcastListener');
                return focusManager.setListenScreen(false).then(() => {
                    sinon.assert.calledOnce(spy);
                });
            });
        }
        if (platform === Platform.IOS) {
            it('should start listening to app foreground events', () => {
                const spy = sinon.spy(core.iOS.Notification, 'addNotificationObserver');
                return focusManager.setListenAppForeground(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                    assert.deepEqual(spy.getCall(0).args[1], []);
                });
            });
            it('should stop listening to app foreground events', () => {
                const spy = sinon.spy(core.iOS.Notification, 'removeNotificationObserver');
                return focusManager.setListenAppForeground(false).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                });
            });
            it('should start listening to app background events', () => {
                const spy = sinon.spy(core.iOS.Notification, 'addNotificationObserver');
                return focusManager.setListenAppBackground(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                    assert.deepEqual(spy.getCall(0).args[1], []);
                });
            });
            it('should stop listening to app background events', () => {
                const spy = sinon.spy(core.iOS.Notification, 'removeNotificationObserver');
                return focusManager.setListenAppBackground(false).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                });
            });
        }
        if (platform === Platform.ANDROID) {
            it('should start listening to Android lifecycle events', () => {
                const spy = sinon.spy(core.Android.Lifecycle, 'register');
                return focusManager.setListenAndroidLifecycle(true).then(() => {
                    sinon.assert.calledOnce(spy);
                    assert.deepEqual(spy.getCall(0).args[0], ['onActivityResumed', 'onActivityPaused']);
                });
            });
            it('should stop listening to Android lifecycle events', () => {
                const spy = sinon.spy(core.Android.Lifecycle, 'unregister');
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
            for (let i = 0; i < 20; i++) {
                core.Connectivity.handleEvent('CONNECTED', [true, 0]);
            }
            sinon.assert.callCount(spy, 10);
        });
        if (platform === Platform.ANDROID) {
            it('should trigger onScreenOn', () => {
                const spy = sinon.spy();
                focusManager.onScreenOn.subscribe(spy);
                core.Android.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
                sinon.assert.calledOnce(spy);
            });
        }
        if (platform === Platform.IOS) {
            it('should trigger onAppForeground', () => {
                const spy = sinon.spy();
                focusManager.onAppForeground.subscribe(spy);
                core.iOS.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                sinon.assert.calledOnce(spy);
            });
            it('should trigger onAppBackground', () => {
                const spy = sinon.spy();
                focusManager.onAppBackground.subscribe(spy);
                core.iOS.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                sinon.assert.calledOnce(spy);
            });
        }
        if (platform === Platform.ANDROID) {
            it('should trigger onActivityResumed', () => {
                const spy = sinon.spy();
                focusManager.onActivityResumed.subscribe(spy);
                core.Android.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                sinon.assert.calledOnce(spy);
            });
            it('should trigger onActivityPaused', () => {
                const spy = sinon.spy();
                focusManager.onActivityPaused.subscribe(spy);
                core.Android.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                sinon.assert.calledOnce(spy);
            });
        }
        it('should handle app foreground status when initialized', () => {
            assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after FocusManager was initialized');
        });
        if (platform === Platform.IOS) {
            it('should handle app foreground status after going to background (on iOS)', () => {
                core.iOS.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on iOS)');
            });
            it('should handle app foreground status after returning to foreground (on iOS)', () => {
                core.iOS.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                core.iOS.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on iOS)');
            });
        }
        if (platform === Platform.ANDROID) {
            it('should handle app foreground status after going to background (on Android)', () => {
                core.Android.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on Android)');
            });
            it('should handle app foreground status after returning to foreground (on Android)', () => {
                core.Android.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                core.Android.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on Android)');
            });
            it('should handle app foreground status when changing Android activities', () => {
                core.Android.Lifecycle.handleEvent('RESUMED', ['com.test.newactivity']);
                core.Android.Lifecycle.handleEvent('PAUSED', ['com.test.oldactivity']);
                assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after changing Android activities');
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9jdXNNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL01hbmFnZXJzL0ZvY3VzTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU1RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQTBCLENBQUM7UUFDL0IsSUFBSSxJQUFjLENBQUM7UUFDbkIsSUFBSSxhQUE0QixDQUFDO1FBQ2pDLElBQUksWUFBMEIsQ0FBQztRQUUvQixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEQs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