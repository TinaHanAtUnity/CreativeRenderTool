import { BaseMetaData } from 'Core/Models/MetaData/BaseMetaData';
export class AdapterMetaData extends BaseMetaData {
    constructor() {
        super('AdapterMetaData', Object.assign({}, BaseMetaData.Schema, { name: ['string', 'undefined'], version: ['string', 'undefined'] }));
        this.set('category', 'adapter');
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
            'adapterName': this.getName(),
            'adapterVersion': this.getVersion()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRhcHRlck1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTW9kZWxzL01ldGFEYXRhL0FkYXB0ZXJNZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFhLE1BQU0sbUNBQW1DLENBQUM7QUFPNUUsTUFBTSxPQUFPLGVBQWdCLFNBQVEsWUFBOEI7SUFDL0Q7UUFDSSxLQUFLLENBQUMsaUJBQWlCLG9CQUNmLFlBQVksQ0FBQyxNQUFNLElBQ3ZCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDN0IsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxJQUNsQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUM3QixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ3RDLENBQUM7SUFDTixDQUFDO0NBQ0oifQ==