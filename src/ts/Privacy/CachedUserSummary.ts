import { UserPrivacyManager, IUserSummary } from 'Ads/Managers/UserPrivacyManager';

// simple static class for caching user summary in init and then retrieving it later
// this is a temporary strategy before there is a production decision on a new approach to fetching and serving user summaries
export class CachedUserSummary {
    public static fetch(privacyManager: UserPrivacyManager): Promise<IUserSummary | undefined> {
        return privacyManager.retrieveUserSummary().then(summary => {
            CachedUserSummary._userSummary = summary;
            return summary;
        }).catch(() => {
            return undefined;
        });
    }

    public static get(): IUserSummary | undefined {
        return CachedUserSummary._userSummary;
    }

    private static _userSummary: IUserSummary | undefined;
}
