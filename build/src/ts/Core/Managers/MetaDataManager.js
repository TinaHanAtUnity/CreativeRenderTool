export class MetaDataManager {
    constructor(core) {
        this._metaDataCache = {};
        this._core = core;
    }
    fetch(MetaDataConstructor, cache = true, keys) {
        let metaData = new MetaDataConstructor();
        if (this._metaDataCache[metaData.getCategory()]) {
            metaData = this._metaDataCache[metaData.getCategory()];
            if (!keys) {
                return Promise.resolve(metaData);
            }
        }
        return metaData.fetch(this._core, keys).then((success) => {
            if (success) {
                if (cache) {
                    this._metaDataCache[metaData.getCategory()] = metaData;
                }
                return metaData;
            }
            return undefined;
        });
    }
    clearCache(category) {
        if (category) {
            if (this._metaDataCache[category]) {
                this._metaDataCache[category] = undefined;
            }
            return;
        }
        this._metaDataCache = {};
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YURhdGFNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTWFuYWdlcnMvTWV0YURhdGFNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sT0FBTyxlQUFlO0lBS3hCLFlBQVksSUFBYztRQUhsQixtQkFBYyxHQUErQixFQUFFLENBQUM7UUFJcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVNLEtBQUssQ0FBeUIsbUJBQStCLEVBQUUsUUFBaUIsSUFBSSxFQUFFLElBQWU7UUFDeEcsSUFBSSxRQUFRLEdBQU0sSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBRTVDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtZQUM3QyxRQUFRLEdBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwQztTQUNKO1FBRUQsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDckQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsSUFBSSxLQUFLLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUM7aUJBQzFEO2dCQUNELE9BQU8sUUFBUSxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sVUFBVSxDQUFDLFFBQWlCO1FBQy9CLElBQUksUUFBUSxFQUFFO1lBQ1YsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQzthQUM3QztZQUNELE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDSiJ9