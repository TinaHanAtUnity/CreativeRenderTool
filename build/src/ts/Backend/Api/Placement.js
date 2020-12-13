import { BackendApi } from 'Backend/BackendApi';
export class Placement extends BackendApi {
    constructor() {
        super(...arguments);
        this._placements = {};
    }
    setDefaultPlacement(placement) {
        this._defaultPlacement = placement;
    }
    getDefaultPlacement() {
        return this._defaultPlacement;
    }
    setPlacementState(placement, state) {
        this._placements[placement] = state;
    }
    getPlacementState(placement) {
        if (!placement) {
            return this._placements[this._defaultPlacement];
        }
        if (placement) {
            return this._placements[placement];
        }
        return 'NOT_AVAILABLE';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL1BsYWNlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBQXpDOztRQXlCWSxnQkFBVyxHQUE4QixFQUFFLENBQUM7SUFFeEQsQ0FBQztJQXpCVSxtQkFBbUIsQ0FBQyxTQUFpQjtRQUN4QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDbEMsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsS0FBYTtRQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4QyxDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBa0I7UUFDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWtCLENBQUMsQ0FBQztTQUNwRDtRQUNELElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUtKIn0=