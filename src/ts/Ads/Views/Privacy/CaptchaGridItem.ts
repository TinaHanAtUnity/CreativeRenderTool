
export interface IGridItemClickedListener {
    onGridItemClick(url: string): void;
}

export class CaptchaGridItem {

    private readonly _id: string;
    private _url: string;
    private _listener: IGridItemClickedListener;
    private _element: HTMLImageElement;

    constructor(id: string, url: string, listener: IGridItemClickedListener) {
        this._id = id;
        this._url = url;
        this._listener = listener;
    }

    public getElement(): HTMLElement {
        this._element = document.createElement('img');
        this._element.id = this._id;
        this._element.classList.add('privacy-captcha-grid-item');
        this._element.src = this._url;

        this._element.addEventListener('click', (event) => this.onItemClickEvent(event), false);

        return this._element;
    }

    public resetElement(url: string) {
        this._url = url;
        this._element.src = '';
        this._element.src = url;
    }

    public onItemClickEvent(event: Event): void {
        event.preventDefault();
        if (this._listener) {
            this._listener.onGridItemClick(this._url);
        }
    }
}
