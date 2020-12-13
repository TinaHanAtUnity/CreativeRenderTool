export const AdUnitContainer = jest.fn(() => {
    return {
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        open: jest.fn().mockResolvedValue(Promise.resolve()),
        close: jest.fn().mockResolvedValue(Promise.resolve()),
        reconfigure: jest.fn().mockResolvedValue(Promise.resolve()),
        setViewFrame: jest.fn().mockResolvedValue(Promise.resolve()),
        reorient: jest.fn().mockResolvedValue(Promise.resolve()),
        getLockedOrientation: jest.fn().mockResolvedValue(Promise.resolve())
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0Q29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9BZFVuaXRzL0NvbnRhaW5lcnMvX19tb2Nrc19fL0FkVW5pdENvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFhQSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDeEMsT0FBNEI7UUFDeEIsZUFBZSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDMUIsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwRCxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyRCxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzRCxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1RCxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4RCxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZFLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyJ9