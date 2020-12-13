import { BaseMetaData } from 'Core/Models/MetaData/BaseMetaData';
export class MediationMetaData extends BaseMetaData {
    constructor() {
        super('MediationMetaData', Object.assign({}, BaseMetaData.Schema, { name: ['string', 'undefined'], version: ['string', 'undefined'], adapter_version: ['string', 'undefined'], ordinal: ['number', 'undefined'], enable_metadata_load: ['boolean', 'undefined'] }));
        this.set('category', 'mediation');
        this.set('keys', ['name', 'version', 'adapter_version', 'ordinal', 'enable_metadata_load']);
    }
    getName() {
        return this.get('name');
    }
    getVersion() {
        return this.get('version');
    }
    getAdapterVersion() {
        return this.get('adapter_version');
    }
    setOrdinal(ordinal) {
        this.set('ordinal', ordinal);
    }
    getOrdinal() {
        return this.get('ordinal');
    }
    isMetaDataLoadEnabled() {
        const enableMetadataLoad = this.get('enable_metadata_load');
        return enableMetadataLoad ? enableMetadataLoad : false;
    }
    getDTO() {
        return {
            'mediationName': this.getName(),
            'mediationVersion': this.getVersion(),
            'mediationAdapterVersion': this.getAdapterVersion(),
            'mediationOrdinal': this.getOrdinal()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkaWF0aW9uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvTWV0YURhdGEvTWVkaWF0aW9uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBYSxNQUFNLG1DQUFtQyxDQUFDO0FBVTVFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxZQUFnQztJQUVuRTtRQUNJLEtBQUssQ0FBQyxtQkFBbUIsb0JBQ2pCLFlBQVksQ0FBQyxNQUFNLElBQ3ZCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDN0IsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUNoQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3hDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDaEMsb0JBQW9CLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLElBQ2hELENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTSxVQUFVLENBQUMsT0FBZTtRQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLE1BQU0sa0JBQWtCLEdBQXdCLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNqRixPQUFPLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzNELENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQy9CLGtCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDckMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ25ELGtCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7U0FDeEMsQ0FBQztJQUNWLENBQUM7Q0FDQSJ9