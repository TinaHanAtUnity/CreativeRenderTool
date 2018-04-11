import { INativeBridge } from 'Native/INativeBridge';
import { BatchInvocation } from 'Native/BatchInvocation';
import { BroadcastApi } from 'Native/Api/Broadcast';
import { CacheApi } from 'Native/Api/Cache';
import { ConnectivityApi } from 'Native/Api/Connectivity';
import { RequestApi } from 'Native/Api/Request';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { EventCategory } from 'Constants/EventCategory';
import { ResolveApi } from 'Native/Api/Resolve';
import { IntentApi } from 'Native/Api/Intent';
import { ListenerApi } from 'Native/Api/Listener';
import { PlacementApi } from 'Native/Api/Placement';
import { SdkApi } from 'Native/Api/Sdk';
import { StorageApi } from 'Native/Api/Storage';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AppSheetApi } from 'Native/Api/AppSheet';
import { CallbackContainer } from 'Utilities/CallbackContainer';
import { Platform } from 'Constants/Platform';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';
import { NotificationApi } from 'Native/Api/Notification';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { LifecycleApi } from 'Native/Api/Lifecycle';
import { WebPlayerApi } from 'Native/Api/WebPlayer';
import { AndroidPreferencesApi } from 'Native/Api/AndroidPreferences';
import { IosPreferencesApi } from 'Native/Api/IosPreferences';
import { SensorInfoApi } from 'Native/Api/SensorInfo';
import { PurchasingApi } from 'Native/Api/Purchasing';
import { PermissionsApi } from 'Native/Api/Permissions';
import { MainBundleApi } from 'Native/Api/MainBundle';
import { ARApi } from 'Native/Api/AR';

export enum CallbackStatus {
    OK,
    ERROR
}

export type INativeCallback = (status: CallbackStatus, ...parameters: any[]) => void;

export class NativeBridge implements INativeBridge {

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private static convertStatus(status: string): CallbackStatus {
        switch(status) {
            case CallbackStatus[CallbackStatus.OK]:
                return CallbackStatus.OK;
            case CallbackStatus[CallbackStatus.ERROR]:
                return CallbackStatus.ERROR;
            default:
                throw new Error('Status string is not valid: ' + status);
        }
    }

    public AR: ARApi;
    public AppSheet: AppSheetApi;
    public AndroidAdUnit: AndroidAdUnitApi;
    public AndroidPreferences: AndroidPreferencesApi;
    public Broadcast: BroadcastApi;
    public Cache: CacheApi;
    public Connectivity: ConnectivityApi;
    public DeviceInfo: DeviceInfoApi;
    public Intent: IntentApi;
    public IosAdUnit: IosAdUnitApi;
    public IosPreferences: IosPreferencesApi;
    public Listener: ListenerApi;
    public Lifecycle: LifecycleApi;
    public Notification: NotificationApi;
    public Placement: PlacementApi;
    public Purchasing: PurchasingApi;
    public Request: RequestApi;
    public Resolve: ResolveApi;
    public Sdk: SdkApi;
    public SensorInfo: SensorInfoApi;
    public Storage: StorageApi;
    public VideoPlayer: VideoPlayerApi;
    public UrlScheme: UrlSchemeApi;
    public WebPlayer: WebPlayerApi;
    public Permissions: PermissionsApi;
    public MainBundle: MainBundleApi;

    private _callbackId: number = 1;
    private _callbackTable: {[key: number]: CallbackContainer<any>} = {};

    private _platform: Platform;
    private _apiLevel: number;
    private _backend: IWebViewBridge;

    private _autoBatchEnabled: boolean;
    private _autoBatch: BatchInvocation;
    private _autoBatchTimer: any; // todo: should be number but causes naming clash with nodejs Timer
    private _autoBatchInterval = 1;

    constructor(backend: IWebViewBridge, platform: Platform = Platform.TEST, autoBatch = true) {
        this._autoBatchEnabled = autoBatch;

        this._platform = platform;
        this._backend = backend;
        this.AR = new ARApi(this);
        this.AppSheet = new AppSheetApi(this);

        if(platform === Platform.IOS) {
            this.IosAdUnit = new IosAdUnitApi(this);
            this.IosPreferences = new IosPreferencesApi(this);
        } else {
            this.AndroidAdUnit = new AndroidAdUnitApi(this);
            this.AndroidPreferences = new AndroidPreferencesApi(this);
        }

        this.Broadcast = new BroadcastApi(this);
        this.Cache = new CacheApi(this);
        this.Connectivity = new ConnectivityApi(this);
        this.DeviceInfo = new DeviceInfoApi(this);
        this.Intent = new IntentApi(this);
        this.Listener = new ListenerApi(this);
        this.Lifecycle = new LifecycleApi(this);
        this.Notification = new NotificationApi(this);
        this.Placement = new PlacementApi(this);
        this.Purchasing = new PurchasingApi(this);
        this.Request = new RequestApi(this);
        this.Resolve = new ResolveApi(this);
        this.Sdk = new SdkApi(this);
        this.SensorInfo = new SensorInfoApi(this);
        this.Storage = new StorageApi(this);
        this.VideoPlayer = new VideoPlayerApi(this);
        this.UrlScheme = new UrlSchemeApi(this);
        this.WebPlayer = new WebPlayerApi(this);
        this.Permissions = new PermissionsApi(this);
        this.MainBundle = new MainBundleApi(this);
    }

    public registerCallback<T>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void): number {
        const id: number = this._callbackId++;
        this._callbackTable[id] = new CallbackContainer(resolve, reject);
        return id;
    }

    public invoke<T>(className: string, methodName: string, parameters?: any[]): Promise<T> {
        if(this._autoBatchEnabled) {
            if(!this._autoBatch) {
                this._autoBatch = new BatchInvocation(this);
            }
            const promise = this._autoBatch.queue<T>(className, methodName, parameters);
            if(!this._autoBatchTimer) {
                this._autoBatchTimer = setTimeout(() => {
                    this.invokeBatch(this._autoBatch);
                    delete this._autoBatch;
                    this._autoBatchTimer = null;
                }, this._autoBatchInterval);
            }
            return promise;
        } else {
            const batch = new BatchInvocation(this);
            const promise = batch.queue<T>(className, methodName, parameters);
            this.invokeBatch(batch);
            return promise;
        }
    }

    public handleCallback(results: any[][]): void {
        results.forEach((result: any[]): void => {
            const id: number = parseInt(result.shift(), 10);
            const status = NativeBridge.convertStatus(result.shift());
            let parameters = result.shift();
            const callbackObject = this._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            if(parameters.length === 1) {
                parameters = parameters[0];
            }
            switch(status) {
                case CallbackStatus.OK:
                    callbackObject.resolve(parameters);
                    break;
                case CallbackStatus.ERROR:
                    callbackObject.reject(parameters);
                    break;
                default:
                    throw new Error('Unknown callback status');
            }
            delete this._callbackTable[id];
        });
    }

    public handleEvent(parameters: any[]): void {
        const category: string = parameters.shift();
        const event: string = parameters.shift();
        switch(category) {
            case EventCategory[EventCategory.APPSHEET]:
                this.AppSheet.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.ADUNIT]:
                if(this.getPlatform() === Platform.IOS) {
                    this.IosAdUnit.handleEvent(event, parameters);
                } else {
                    this.AndroidAdUnit.handleEvent(event, parameters);
                }
                break;

            case EventCategory[EventCategory.BROADCAST]:
                this.Broadcast.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CACHE]:
                this.Cache.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CONNECTIVITY]:
                this.Connectivity.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.NOTIFICATION]:
                this.Notification.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.LIFECYCLE]:
                this.Lifecycle.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.REQUEST]:
                this.Request.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.RESOLVE]:
                this.Resolve.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.VIDEOPLAYER]:
                this.VideoPlayer.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.STORAGE]:
                this.Storage.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.PURCHASING]:
                this.Purchasing.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.DEVICEINFO]:
                if(this.getPlatform() === Platform.IOS) {
                    this.DeviceInfo.Ios.handleEvent(event, parameters);
                } else {
                    this.DeviceInfo.Android.handleEvent(event, parameters);
                }
                break;

            case EventCategory[EventCategory.WEBPLAYER]:
                this.WebPlayer.handleEvent(event, parameters);
                break;
            case EventCategory[EventCategory.AR]:
                this.AR.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.PERMISSIONS]:
                if(this.getPlatform() === Platform.ANDROID) {
                    this.Permissions.Android.handleEvent(event, parameters);
                } else {
                    this.Permissions.Ios.handleEvent(event, parameters);
                }
                break;

            default:
                throw new Error('Unknown event category: ' + category);
        }
    }

    public handleInvocation(parameters: any[]): void {
        const className: string = parameters.shift();
        const methodName: string = parameters.shift();
        const callback: string = parameters.shift();
        parameters.push((status: CallbackStatus, ...callbackParameters: any[]) => {
            this.invokeCallback(callback, CallbackStatus[status], ...callbackParameters);
        });
        (<any>window)[className][methodName].apply((<any>window)[className], parameters);
    }

    public setApiLevel(apiLevel: number) {
        this._apiLevel = apiLevel;
    }

    public getApiLevel(): number {
        return this._apiLevel;
    }

    public getPlatform(): Platform {
        return this._platform;
    }

    private invokeBatch(batch: BatchInvocation): void {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    private invokeCallback(id: string, status: string, ...parameters: any[]): void {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
