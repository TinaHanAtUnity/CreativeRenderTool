export interface IObserver {
    (id: string, ...parameters: any[]): void;
}
