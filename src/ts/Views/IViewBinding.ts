export interface IViewBinding {
    selector: string;
    event: string;
    listener: (event: Event) => void;
}
