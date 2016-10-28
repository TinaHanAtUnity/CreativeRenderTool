import { Tap } from 'Utilities/Tap';

export interface IViewBinding {
    selector?: string;
    event: string;
    listener: (event: Event) => void;
    tap?: Tap;
}
