export const ThirdPartyEventManager = jest.fn(() => {
    return {
        sendTrackingEvents: jest.fn().mockImplementation(() => Promise.resolve()),
        setTemplateValue: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvX19tb2Nrc19fL1RoaXJkUGFydHlFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDL0MsT0FBbUM7UUFDL0Isa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6RSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyJ9