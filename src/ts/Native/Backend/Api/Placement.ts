export class Placement {

    public static setDefaultPlacement(placement: string) {
        return;
    }

    public static setPlacementState(placement: string, state: string) {
        const button = <HTMLButtonElement>window.parent.document.getElementById(placement);
        const listener = (event: Event) => {
            event.preventDefault();
            // tslint:disable:no-string-literal
            window['webview']['show'](placement, {}, () => {
                return;
            });
            // tslint:enable:no-string-literal
        };
        if(state === 'READY') {
            button.disabled = false;
            button.addEventListener('click', listener, false);
        } else {
            button.disabled = true;
            button.removeEventListener('click', listener, false);
        }
    }

}