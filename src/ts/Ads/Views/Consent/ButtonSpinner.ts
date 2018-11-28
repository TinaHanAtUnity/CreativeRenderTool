import { View } from 'Core/Views/View';
import ButtonSpinnerTemplate from 'html/consent/button-spinner.html';
import { Platform } from "../../../Core/Constants/Platform";
import { Template } from "../../../Core/Utilities/Template";


export interface IButtonSpinnerHandler {

}

export class ButtonSpinner extends View<IButtonSpinnerHandler> {

    constructor(platform: Platform) {
        super(platform, 'button-spinner');

        this._template = new Template(ButtonSpinnerTemplate);

        this._bindings = [];

    }
}
