import { Tap } from 'Utilities/Tap';
import { Swipe } from 'Utilities/Swipe';

export interface IViewBinding {
    selector?: string;
    event: string;
    listener: (event: Event) => void;
    tap?: Tap;
    swipe?: Swipe;
}
