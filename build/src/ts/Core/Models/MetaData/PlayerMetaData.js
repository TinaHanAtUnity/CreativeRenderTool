import { BaseMetaData } from 'Core/Models/MetaData/BaseMetaData';
import { StorageType } from 'Core/Native/Storage';
export class PlayerMetaData extends BaseMetaData {
    constructor() {
        super('PlayerMetaData', Object.assign({}, BaseMetaData.Schema, { server_id: ['string'] }));
        this.set('keys', ['server_id']);
        this.set('category', 'player');
    }
    fetch(core, keys) {
        return super.fetch(core, keys).then((exists) => {
            if (exists) {
                return core.Storage.delete(StorageType.PUBLIC, this.getCategory()).then(() => {
                    core.Storage.write(StorageType.PUBLIC);
                    return true;
                });
            }
            else {
                return Promise.resolve(false);
            }
        });
    }
    getServerId() {
        return this.get('server_id');
    }
    getDTO() {
        return {
            'sid': this.getServerId()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvTWV0YURhdGEvUGxheWVyTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBYSxNQUFNLG1DQUFtQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQU1sRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFlBQTZCO0lBRTdEO1FBQ0ksS0FBSyxDQUFDLGdCQUFnQixvQkFDZCxZQUFZLENBQUMsTUFBTSxJQUN2QixTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFDdkIsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQWMsRUFBRSxJQUFlO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDM0MsSUFBSSxNQUFNLEVBQUU7Z0JBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3pFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtTQUM1QixDQUFDO0lBQ04sQ0FBQztDQUNKIn0=