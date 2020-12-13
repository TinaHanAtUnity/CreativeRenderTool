import { StorageError, StorageType } from 'Core/Native/Storage';
export class MetaData {
    constructor(core) {
        this._core = core;
    }
    get(key, deleteValue) {
        return this._core.Storage.get(StorageType.PUBLIC, key + '.value').then((value) => {
            if (deleteValue) {
                this._core.Storage.delete(StorageType.PUBLIC, key);
                this._core.Storage.write(StorageType.PUBLIC);
            }
            return Promise.resolve([true, value]);
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    // it is normal that a value is not found
                    return Promise.resolve([false, null]);
                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return Promise.resolve([false, null]);
                default:
                    throw new Error(error);
            }
        });
    }
    getKeys(category) {
        return this._core.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
            return results;
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return [];
                default:
                    throw new Error(error);
            }
        });
    }
    hasCategory(category) {
        return this._core.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
            return results.length > 0;
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return false;
                default:
                    throw new Error(error);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVoRSxNQUFNLE9BQU8sUUFBUTtJQUdqQixZQUFZLElBQWM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVNLEdBQUcsQ0FBSSxHQUFXLEVBQUUsV0FBb0I7UUFDM0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBUSxFQUFFLEVBQUU7WUFDbkYsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEQ7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDakIsUUFBUSxLQUFLLEVBQUU7Z0JBQ1gsS0FBSyxZQUFZLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO29CQUM3Qyx5Q0FBeUM7b0JBQ3pDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUUxQyxLQUFLLFlBQVksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUM7b0JBQy9DLDREQUE0RDtvQkFDNUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRTFDO29CQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxPQUFPLENBQUMsUUFBZ0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xGLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRTtZQUNqQixRQUFRLEtBQUssRUFBRTtnQkFDWCxLQUFLLFlBQVksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUM7b0JBQy9DLDREQUE0RDtvQkFDNUQsT0FBTyxFQUFFLENBQUM7Z0JBRWQ7b0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLFdBQVcsQ0FBQyxRQUFnQjtRQUMvQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbEYsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDakIsUUFBUSxLQUFLLEVBQUU7Z0JBQ1gsS0FBSyxZQUFZLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDO29CQUMvQyw0REFBNEQ7b0JBQzVELE9BQU8sS0FBSyxDQUFDO2dCQUVqQjtvQkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==