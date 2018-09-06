import {
    IObserver0,
    IObserver1,
    IObserver2,
    IObserver3,
    IObserver4,
    IObserver5,
    IObserver6
} from 'Core/Utilities/IObserver';

export abstract class Observable<T> {

    protected _observers: T[] = [];

    public subscribe(observer: T): T {
        this._observers.push(observer);
        return observer;
    }

    public unsubscribe(observer?: T): void {
        if(this._observers.length) {
            if(typeof observer !== 'undefined') {
                this._observers = this._observers.filter(storedObserver => storedObserver !== observer);
            } else {
                this._observers = [];
            }
        }
    }

}

export class Observable0 extends Observable<IObserver0> {

    public trigger(): void {
        this._observers.forEach(observer => observer());
    }

}

export class Observable1<P1> extends Observable<IObserver1<P1>> {

    public trigger(p1: P1): void {
        this._observers.forEach(observer => observer(p1));
    }

}

export class Observable2<P1, P2> extends Observable<IObserver2<P1, P2>> {

    public trigger(p1: P1, p2: P2): void {
        this._observers.forEach(observer => observer(p1, p2));
    }

}

export class Observable3<P1, P2, P3> extends Observable<IObserver3<P1, P2, P3>> {

    public trigger(p1: P1, p2: P2, p3: P3): void {
        this._observers.forEach(observer => observer(p1, p2, p3));
    }

}

export class Observable4<P1, P2, P3, P4> extends Observable<IObserver4<P1, P2, P3, P4>> {

    public trigger(p1: P1, p2: P2, p3: P3, p4: P4): void {
        this._observers.forEach(observer => observer(p1, p2, p3, p4));
    }

}

export class Observable5<P1, P2, P3, P4, P5> extends Observable<IObserver5<P1, P2, P3, P4, P5>> {

    public trigger(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): void {
        this._observers.forEach(observer => observer(p1, p2, p3, p4, p5));
    }

}

export class Observable6<P1, P2, P3, P4, P5, P6> extends Observable<IObserver6<P1, P2, P3, P4, P5, P6>> {

    public trigger(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): void {
        this._observers.forEach(observer => observer(p1, p2, p3, p4, p5, p6));
    }

}
