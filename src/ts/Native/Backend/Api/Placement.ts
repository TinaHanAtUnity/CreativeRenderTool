export class Placement {

    public static setDefaultPlacement(placement: string) {
        Placement._defaultPlacement = placement;
    }

    public static getDefaultPlacement() {
        return Placement._defaultPlacement;
    }

    public static setPlacementState(placement: string, state: string) {
        Placement._placements[placement] = state;
    }

    public static getPlacementState(placement?: string) {
        if(!placement) {
            placement = Placement._defaultPlacement;
        }
        if(placement) {
            return Placement._placements[placement];
        }
        return 'NOT_AVAILABLE';
    }

    private static _defaultPlacement: string | undefined;
    private static _placements: { [key: string]: string } = {};

}
