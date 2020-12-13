import { Model } from 'Core/Models/Model';
export class AutomatedExperiment extends Model {
    constructor(data) {
        super('AutomatedExperiment', AutomatedExperiment.Schema, data);
    }
    getActions() {
        return this.get('actions');
    }
    getDefaultActions() {
        return this.get('defaultActions');
    }
    isCacheDisabled() {
        return this.get('cacheDisabled');
    }
    getDTO() {
        return {
            'actions': this.getActions(),
            'defaultAction': this.getDefaultActions(),
            'cacheDisabled': this.isCacheDisabled()
        };
    }
    isValid(actions) {
        const actionsSpace = this.getActions();
        const actionNames = Object.keys(actionsSpace);
        for (const actionName of actionNames) {
            if (!Object.values(actionsSpace[actionName]).includes(actions[actionName])) {
                return false;
            }
        }
        return true;
    }
}
AutomatedExperiment.Schema = {
    actions: ['object'],
    defaultActions: ['object'],
    cacheDisabled: ['boolean', 'undefined']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b21hdGVkRXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NYWJFeHBlcmltZW50YXRpb24vTW9kZWxzL0F1dG9tYXRlZEV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFXLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBdUJuRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsS0FBMkI7SUFPaEUsWUFBWSxJQUEwQjtRQUNsQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxpQkFBaUI7UUFDcEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVNLGVBQWU7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzVCLGVBQWUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDekMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7U0FDMUMsQ0FBQztJQUNOLENBQUM7SUFFTSxPQUFPLENBQUMsT0FBZ0M7UUFDM0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFOUMsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUN4RSxPQUFPLEtBQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQzs7QUF6Q2EsMEJBQU0sR0FBa0M7SUFDbEQsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQ25CLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUMxQixhQUFhLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO0NBQzFDLENBQUMifQ==