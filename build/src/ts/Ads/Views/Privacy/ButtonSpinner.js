import { View } from 'Core/Views/View';
import ButtonSpinnerTemplate from 'html/consent/button-spinner.html';
import { Template } from 'Core/Utilities/Template';
export class ButtonSpinner extends View {
    constructor(platform) {
        super(platform, 'button-spinner');
        this._template = new Template(ButtonSpinnerTemplate);
        this._bindings = [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uU3Bpbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvUHJpdmFjeS9CdXR0b25TcGlubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLHFCQUFxQixNQUFNLGtDQUFrQyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxNQUFNLE9BQU8sYUFBYyxTQUFRLElBQVE7SUFFdkMsWUFBWSxRQUFrQjtRQUMxQixLQUFLLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXhCLENBQUM7Q0FDSiJ9