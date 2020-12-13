import { AdUnit } from 'Backend/Api/AdUnit';
import { Analytics } from 'Backend/Api/Analytics';
import { AppSheet } from 'Backend/Api/AppSheet';
import { Broadcast } from 'Backend/Api/Broadcast';
import { Cache } from 'Backend/Api/Cache';
import { Connectivity } from 'Backend/Api/Connectivity';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Intent } from 'Backend/Api/Intent';
import { Lifecycle } from 'Backend/Api/Lifecycle';
import { Listener } from 'Backend/Api/Listener';
import { MonetizationListener } from 'Backend/Api/MonetizationListener';
import { Notification } from 'Backend/Api/Notification';
import { Placement } from 'Backend/Api/Placement';
import { PlacementContents } from 'Backend/Api/PlacementContents';
import { Request } from 'Backend/Api/Request';
import { Resolve } from 'Backend/Api/Resolve';
import { Sdk } from 'Backend/Api/Sdk';
import { Storage } from 'Backend/Api/Storage';
import { UrlScheme } from 'Backend/Api/UrlScheme';
import { VideoPlayer } from 'Backend/Api/VideoPlayer';
import { Platform } from 'Core/Constants/Platform';
import { CallbackStatus } from 'Core/Native/Bridge/NativeBridge';
import { IosPreferences } from 'Backend/Api/IosPreferences';
import { AndroidPreferences } from 'Backend/Api/AndroidPreferences';
import { BannerListener } from 'Backend/Api/BannerListener';
import { AndroidStore } from 'Backend/Api/AndroidStore';
import { Products } from 'Backend/Api/Products';
import { BannerBackendApi } from 'Backend/Api/Banner';
import { ClassDetection } from 'Backend/Api/ClassDetection';
import { TrackingManager } from 'Backend/Api/TrackingManager';
export class Backend {
    constructor(platform) {
        this._platform = platform;
        this.Api = {
            AdUnit: new AdUnit(this),
            Analytics: new Analytics(this),
            AppSheet: new AppSheet(this),
            Broadcast: new Broadcast(this),
            Cache: new Cache(this),
            Connectivity: new Connectivity(this),
            DeviceInfo: new DeviceInfo(this),
            ClassDetection: new ClassDetection(this),
            Intent: new Intent(this),
            Lifecycle: new Lifecycle(this),
            Listener: new Listener(this),
            MonetizationListener: new MonetizationListener(this),
            Notification: new Notification(this),
            Placement: new Placement(this),
            PlacementContents: new PlacementContents(this),
            Preferences: platform === Platform.IOS ? new IosPreferences(this) : new AndroidPreferences(this),
            Products: new Products(this),
            Request: new Request(this),
            Resolve: new Resolve(this),
            Sdk: new Sdk(this),
            Storage: new Storage(this),
            Store: new AndroidStore(this),
            UrlScheme: new UrlScheme(this),
            VideoPlayer: new VideoPlayer(this),
            BannerListener: new BannerListener(this),
            Banner: new BannerBackendApi(this),
            TrackingManager: new TrackingManager(this)
        };
    }
    setNativeBridge(nativeBridge) {
        this._nativeBridge = nativeBridge;
    }
    sendEvent(category, name, ...parameters) {
        this._nativeBridge.handleEvent([category, name].concat(parameters));
    }
    getPlatform() {
        return this._nativeBridge.getPlatform();
    }
    handleInvocation(rawInvocations) {
        const invocations = JSON.parse(rawInvocations).map((invocation) => this.parseInvocation(invocation));
        const results = invocations.map((invocation) => this.executeInvocation(invocation));
        this._nativeBridge.handleCallback(results.map(result => [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters]));
    }
    handleCallback(id, status, parameters) {
        return;
    }
    parseInvocation(invocation) {
        return {
            className: invocation[0],
            method: invocation[1],
            parameters: invocation[2],
            callbackId: invocation[3]
        };
    }
    executeInvocation(invocation) {
        const api = (() => {
            if (this._platform === Platform.ANDROID) {
                const splitClassName = invocation.className.split('.');
                const apiKey = splitClassName[splitClassName.length - 1];
                return this.Api[apiKey];
            }
            else if (this._platform === Platform.IOS) {
                const splitClassName = invocation.className.split('Api');
                const apiKey = splitClassName[1];
                return this.Api[apiKey];
            }
        })();
        if (!api) {
            throw new Error('Missing backend API implementation for: ' + invocation.className);
        }
        // @ts-ignore
        const method = api[invocation.method];
        if (!method) {
            throw new Error('Missing backend API method: ' + invocation.className + '.' + invocation.method);
        }
        try {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.OK,
                parameters: [method.apply(api, invocation.parameters)]
            };
        }
        catch (error) {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.ERROR,
                parameters: [error]
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9CYWNrZW5kL0JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFD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