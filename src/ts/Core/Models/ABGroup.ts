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

// for unit tests
export const FakeEnabledABTest = new ABTest(16, 17);
export const FakeDisabledABTest = new DisabledABTest(16, 17);

// Add actual A/B tests below
export const AuctionV5Test = new ABTest(15, 18);
export const VastParsingStrictTest = new ABTest(17);
export const WebPlayerMRAIDTest = new DisabledABTest();
export const AccessibleCloseButtonTest = new ABTest(7, 8);
// Two hold out groups that should not get the install now button in rewarded videos
export const HoldOutInstallInRewardedVideos = new ABTest(5, 6);
export const AccessibleMRAIDCloseButtonTest = new ABTest(7, 8);
