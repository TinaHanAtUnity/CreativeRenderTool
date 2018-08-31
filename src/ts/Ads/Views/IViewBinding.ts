import { Swipe } from 'Core/Utilities/Swipe';
import { Tap } from 'Core/Utilities/Tap';

type IViewListenerFunction = (event: Event) => void;

export interface IViewBinding {
    selector?: string;
    event: string;
    listener: IViewListenerFunction;
    tap?: Tap;
    swipe?: Swipe;
}
