import { Asset } from 'Ads/Models/Assets/Asset';
export class Font extends Asset {
    constructor(url, session, family, color, size, creativeId) {
        super('Font', session, Object.assign({}, Asset.Schema, { family: ['string'], color: ['string'], size: ['number'] }));
        this.set('url', url);
        this.set('creativeId', creativeId);
        this.set('family', family);
        this.set('color', color);
        this.set('size', size);
    }
    getDescription() {
        return 'FONT';
    }
    getFamily() {
        return this.get('family');
    }
    getColor() {
        return this.get('color');
    }
    getSize() {
        return this.get('size');
    }
    getDTO() {
        return {
            'family': this.getFamily(),
            'color': this.getColor(),
            'size': this.getSize(),
            'url': this.getUrl()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9udC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTW9kZWxzL0Fzc2V0cy9Gb250LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQVUsTUFBTSx5QkFBeUIsQ0FBQztBQVV4RCxNQUFNLE9BQU8sSUFBSyxTQUFRLEtBQVk7SUFDbEMsWUFBWSxHQUFXLEVBQUUsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsS0FBYSxFQUFFLElBQVksRUFBRSxVQUFtQjtRQUN2RyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sb0JBQ2IsS0FBSyxDQUFDLE1BQU0sSUFDaEIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ2xCLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNqQixJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFDbEIsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzFCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO1NBQ3ZCLENBQUM7SUFDTixDQUFDO0NBQ0oifQ==