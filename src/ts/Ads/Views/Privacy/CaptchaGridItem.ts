
export interface IGridItemClickedListener {
    onGridItemClick(url: string): void;
}

export class CaptchaGridItem {

    private readonly _id: string;
    private readonly _url: string;
    private _listener: IGridItemClickedListener;

    constructor(id: string, url: string, listener: IGridItemClickedListener) {
        this._id = id;
        this._url = url;
        this._listener = listener;
    }

    public getElement(): HTMLElement {
        const element = document.createElement('img');
        element.id = this._id;
        element.classList.add('privacy-captcha-grid-item');
        element.src = this._url;

        element.addEventListener('click', (event) => this.onItemClickEvent(event), false);

        return element;
    }

    public onItemClickEvent(event: Event): void {
        event.preventDefault();
        if (this._listener) {
            this._listener.onGridItemClick(this._url);
        }
    }
}
