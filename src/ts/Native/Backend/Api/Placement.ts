export class Placement {

    public static setDefaultPlacement(placement: string) {

    }

    public static setPlacementState(placement: string, state: string) {
        let button = <HTMLButtonElement>window.parent.document.getElementById(placement);
        let listener = (event: Event) => {
            event.preventDefault();
            // tslint:disable:no-string-literal
            window['webview']['show'](placement, {}, () => {});
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