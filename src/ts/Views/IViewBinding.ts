import { Tap } from 'Utilities/Tap';
import { Swipe } from 'Utilities/Swipe';

type IViewListenerFunction = (event: Event) => void;

export interface IViewBinding {
    selector?: string;
    event: string;
    listener: IViewListenerFunction;
    tap?: Tap;
    swipe?: Swipe;
}
