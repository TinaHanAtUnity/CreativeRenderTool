import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';

export interface IPopupEventHandler {
    onShowPopup(): void;
    onPopupClosed(): void;
    onPopupVisible(): void;
}

export class PopupController implements IPrivacyHandlerView {

    private _showingPrivacy: boolean;
    private readonly _privacySettings: AbstractPrivacy;

    protected _handlers: IPopupEventHandler[];

    constructor(privacySettings: AbstractPrivacy) {
        this._privacySettings = privacySettings;
        this._showingPrivacy = false;
        this._handlers = [];
    }

    public addEventHandler(handler: IPopupEventHandler): IPopupEventHandler {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: IPopupEventHandler): void {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            } else {
                this._handlers = [];
            }
        }
    }

    public show(): void {
        if (!this._privacySettings.container() || !this._privacySettings.container().parentElement) {
            this._privacySettings.render();
            this._privacySettings.hide();
            document.body.appendChild(this._privacySettings.container());
            this._privacySettings.addEventHandler(this);
        }

        this._showingPrivacy = true;
        this._handlers.forEach(handler => handler.onShowPopup());

        this._privacySettings.show();

        this._handlers.forEach(handler => handler.onPopupVisible());
    }

    public hideAndRemovePopups(): void {
        this._showingPrivacy = false;

        if (this._privacySettings) {
            this._privacySettings.removeEventHandler(this);
            this._privacySettings.hide();
            const container = this._privacySettings.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
    }

    public isShowing(): boolean {
        return this._showingPrivacy;
    }

    public onPrivacyClose(): void {
        this._privacySettings.hide();
        this._showingPrivacy = false;
        this._handlers.forEach(handler => handler.onPopupClosed());
    }
}
