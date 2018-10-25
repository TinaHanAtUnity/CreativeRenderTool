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

    public static getPlacementState(placement?: string): string {
        if (placement) {
            return Placement._placements[placement];
        } else if(Placement._defaultPlacement) {
            return Placement._placements[Placement._defaultPlacement];
        } else {
            return 'NOT_AVAILABLE';
        }
    }

    private static _defaultPlacement: string | undefined;
    private static _placements: { [key: string]: string } = {};

}
