import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { Polyfiller } from 'Core/Utilities/Polyfiller';

// In certain versions of Android, we found that DOMParser might not support
// parsing text/html mime types.

// tslint:disable:no-empty

(((DOMParser) => {

    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new DOMParser()).parseFromString('', 'text/html')) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) {
    }

    DOMParser.prototype.parseFromString = DOMUtils.parseFromString;

})(DOMParser));

// tslint:enable:no-empty

/*
 *  Object.values() has issues with older Android Devices.
 */
if (!Object.values) {
    Object.values = Polyfiller.getObjectValuesFunction();
}
