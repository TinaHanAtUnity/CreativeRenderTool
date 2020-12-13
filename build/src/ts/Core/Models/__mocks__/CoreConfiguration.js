export const CoreConfiguration = jest.fn(() => {
    return {
        getTestMode: jest.fn().mockReturnValue(false),
        getToken: jest.fn().mockReturnValue(''),
        getProperties: jest.fn().mockReturnValue(''),
        getUnityProjectId: jest.fn().mockReturnValue(''),
        getAbGroup: jest.fn().mockReturnValue(99),
        getOrganizationId: jest.fn().mockReturnValue(''),
        getDeveloperId: jest.fn().mockReturnValue(''),
        isCoppaCompliant: jest.fn().mockImplementation(() => true),
        getCountry: jest.fn().mockImplementation(() => 'us')
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvX19tb2Nrc19fL0NvcmVDb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWVBLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQzFDLE9BQThCO1FBQzFCLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUM3QyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDdkMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQzVDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQ2hELFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztRQUN6QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztRQUNoRCxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDN0MsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztRQUMxRCxVQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztLQUN2RCxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMifQ==