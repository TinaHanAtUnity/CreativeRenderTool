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
    }
    catch (ex) {
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
Array.prototype.unique = function () {
    // tslint:disable-next-line
    return this.filter((val, index) => this.indexOf(val) === index);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya2Fyb3VuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvV29ya2Fyb3VuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV2RCw0RUFBNEU7QUFDNUUsZ0NBQWdDO0FBRWhDLDBCQUEwQjtBQUUxQixDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtJQUVaLHFEQUFxRDtJQUNyRCxJQUFJO1FBQ0EsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTtZQUNwRCwwQ0FBMEM7WUFDMUMsT0FBTztTQUNWO0tBQ0o7SUFBQyxPQUFPLEVBQUUsRUFBRTtLQUNaO0lBRUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztBQUVuRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRWYseUJBQXlCO0FBRXpCOztHQUVHO0FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7SUFDaEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztDQUN4RDtBQVdELEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHO0lBQ3JCLDJCQUEyQjtJQUMzQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyJ9