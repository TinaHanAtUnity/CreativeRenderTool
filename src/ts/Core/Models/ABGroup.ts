import { setGameIds } from 'Ads/Utilities/CustomFeatures';
import ExcludedGamesJson from 'json/custom_features/ExcludedGameIds.json';
import ExcludedOrganizationJson from 'json/custom_features/ExcludedOrganizationIds.json';

type ReferenceGroups = 0 | 1 | 2 | 3 | 4;
type TreatmentGroups = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;
export type ABGroup = ReferenceGroups | TreatmentGroups | -1 | 99;

export function toAbGroup(group: number) : ABGroup {
    if (group === 99) {
        return 99;
    }

    if (group >= 0 && group <= 19) {
        return <ABGroup>group;
    }
    return -1;
}

type AllowedGroups = TreatmentGroups;

const ExcludedGameIds = setGameIds(ExcludedGamesJson);
const ExcludedOrganizationIds = setGameIds(ExcludedOrganizationJson);

class ABTest {
    private _groups: ABGroup[];

    constructor(...groups: AllowedGroups[]) {
        this._groups = groups;
    }

    public isValid(group: ABGroup): boolean {
        return this._groups.indexOf(group) !== -1;
    }
}

class DisabledABTest extends ABTest {
    constructor(...groups: AllowedGroups[]) {
        super(...groups);
    }

    public isValid(group: ABGroup): boolean {
        return false;
    }
}

export class FilteredABTest extends ABTest {
    private static _allowTest: boolean = true;

    public static setup(gameId: string, organizationId: string | undefined) {
        FilteredABTest._allowTest = true;
        if (FilteredABTest.isExcludedOrganization(organizationId) || FilteredABTest.isExcludedGameId(gameId)) {
            FilteredABTest._allowTest = false;
        }
    }

    private static isExcludedOrganization(organizationId: string | undefined): boolean {
        return organizationId !== undefined ? this.existsInList(ExcludedOrganizationIds, organizationId) : false;
    }

    private static isExcludedGameId(gameId: string): boolean {
        return this.existsInList(ExcludedGameIds, gameId);
    }

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }

    public isValid(group: ABGroup): boolean {
        return FilteredABTest._allowTest && super.isValid(group);
    }
}

// for unit tests
export const FakeEnabledABTest = new ABTest(16, 17);
export const FakeDisabledABTest = new DisabledABTest(16, 17);
export const FakeFilteredABTest = new FilteredABTest(16, 17);

// Add actual A/B tests below
export const ConsentAltTitle = new ABTest(9, 10);
export const AuctionV5Test = new ABTest(15, 18);
export const WebPlayerMRAIDTest = new DisabledABTest();

// Two hold out groups that should not get the install now button in rewarded videos
export const HoldOutInstallInRewardedVideos = new ABTest(5, 6);
export const SkipUnderTimerExperiment = new DisabledABTest(7, 8);
