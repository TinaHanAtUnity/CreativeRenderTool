import { Asset } from 'Ads/Models/Assets/Asset';
export class Image extends Asset {
    constructor(url, session) {
        super('Image', session, Asset.Schema);
        this.set('url', url);
    }
    getDescription() {
        return 'IMAGE';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9Bc3NldHMvSW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR2hELE1BQU0sT0FBTyxLQUFNLFNBQVEsS0FBSztJQUM1QixZQUFZLEdBQVcsRUFBRSxPQUFnQjtRQUNyQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVNLGNBQWM7UUFDakIsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=