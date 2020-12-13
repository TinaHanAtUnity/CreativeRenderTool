import { BaseMetaData } from 'Core/Models/MetaData/BaseMetaData';
export class FrameworkMetaData extends BaseMetaData {
    constructor() {
        super('FrameworkMetaData', Object.assign({}, BaseMetaData.Schema, { name: ['string', 'undefined'], version: ['string', 'undefined'] }));
        this.set('category', 'framework');
        this.set('keys', ['name', 'version']);
    }
    getName() {
        return this.get('name');
    }
    getVersion() {
        return this.get('version');
    }
    getDTO() {
        return {
            'frameworkName': this.getName(),
            'frameworkVersion': this.getVersion()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhbWV3b3JrTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvTWV0YURhdGEvRnJhbWV3b3JrTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBYSxNQUFNLG1DQUFtQyxDQUFDO0FBTzVFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxZQUFnQztJQUNuRTtRQUNJLEtBQUssQ0FBQyxtQkFBbUIsb0JBQ2pCLFlBQVksQ0FBQyxNQUFNLElBQ3ZCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDN0IsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxJQUNsQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUMvQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ3hDLENBQUM7SUFDTixDQUFDO0NBQ0oifQ==