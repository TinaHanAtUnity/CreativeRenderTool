import { PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
export class RequestPrivacyFactory {
    static create(privacySDK, limitAdTracking) {
        let method;
        let permissions = UserPrivacy.PERM_ALL_FALSE;
        const isRecorded = privacySDK.isOptOutRecorded();
        if (isRecorded) {
            const userPrivacy = privacySDK.getUserPrivacy();
            method = userPrivacy.getMethod();
            permissions = userPrivacy.getPermissions();
        }
        else {
            const gamePrivacyMethod = privacySDK.getGamePrivacy().getMethod();
            switch (gamePrivacyMethod) {
                case PrivacyMethod.UNITY_CONSENT:
                    permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.LEGITIMATE_INTEREST:
                    permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.DEVELOPER_CONSENT:
                    permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.DEFAULT:
                    permissions = UserPrivacy.PERM_ALL_TRUE;
                    break;
                default: permissions = UserPrivacy.PERM_ALL_FALSE;
            }
            method = gamePrivacyMethod;
        }
        if (limitAdTracking) {
            permissions = UserPrivacy.PERM_ALL_FALSE;
        }
        return {
            method: method,
            firstRequest: !isRecorded,
            permissions: {
                ads: permissions.ads,
                external: permissions.external,
                gameExp: permissions.gameExp
            }
        };
    }
    static createLegacy(privacySDK) {
        return {
            gdprEnabled: privacySDK.isGDPREnabled(),
            optOutRecorded: privacySDK.isOptOutRecorded(),
            optOutEnabled: privacySDK.isOptOutEnabled()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFByaXZhY3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9SZXF1ZXN0UHJpdmFjeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUgsYUFBYSxFQUFFLFdBQVcsRUFDN0IsTUFBTSxpQkFBaUIsQ0FBQztBQWV6QixNQUFNLE9BQU8scUJBQXFCO0lBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBc0IsRUFBRSxlQUFvQztRQUM3RSxJQUFJLE1BQXFCLENBQUM7UUFDMUIsSUFBSSxXQUFXLEdBQXdCLFdBQVcsQ0FBQyxjQUFjLENBQUM7UUFDbEUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFakQsSUFBSSxVQUFVLEVBQUU7WUFDWixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDaEQsTUFBTSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqQyxXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQzlDO2FBQU07WUFDSCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsRSxRQUFRLGlCQUFpQixFQUFFO2dCQUN2QixLQUFLLGFBQWEsQ0FBQyxhQUFhO29CQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDO29CQUN2RSxNQUFNO2dCQUNWLEtBQUssYUFBYSxDQUFDLG1CQUFtQjtvQkFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQztvQkFDN0UsTUFBTTtnQkFDVixLQUFLLGFBQWEsQ0FBQyxpQkFBaUI7b0JBQUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUM7b0JBQzNFLE1BQU07Z0JBQ1YsS0FBSyxhQUFhLENBQUMsT0FBTztvQkFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztvQkFDaEUsTUFBTTtnQkFDVixPQUFPLENBQUMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQzthQUNyRDtZQUNELE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztTQUM5QjtRQUVELElBQUksZUFBZSxFQUFFO1lBQ2pCLFdBQVcsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDO1NBQzVDO1FBRUQsT0FBTztZQUNILE1BQU0sRUFBRSxNQUFNO1lBQ2QsWUFBWSxFQUFFLENBQUMsVUFBVTtZQUN6QixXQUFXLEVBQUU7Z0JBQ1QsR0FBRyxFQUFFLFdBQVcsQ0FBQyxHQUFHO2dCQUNwQixRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7Z0JBQzlCLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTzthQUMvQjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFzQjtRQUM3QyxPQUFPO1lBQ0gsV0FBVyxFQUFFLFVBQVUsQ0FBQyxhQUFhLEVBQUU7WUFDdkMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM3QyxhQUFhLEVBQUUsVUFBVSxDQUFDLGVBQWUsRUFBRTtTQUM5QyxDQUFDO0lBQ04sQ0FBQztDQUNKIn0=