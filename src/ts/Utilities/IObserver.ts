export interface IObserver0 {
    (): void;
}

export interface IObserver1<P1> {
    (p1: P1): void;
}

export interface IObserver2<P1, P2> {
    (p1: P1, p2: P2): void;
}

export interface IObserver3<P1, P2, P3> {
    (p1: P1, p2: P2, p3: P3): void;
}

export interface IObserver4<P1, P2, P3, P4> {
    (p1: P1, p2: P2, p3: P3, p4: P4): void;
}

export interface IObserver5<P1, P2, P3, P4, P5> {
    (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): void;
}
