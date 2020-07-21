type ReferenceGroups = 0 | 1 | 2 | 3 | 4;
type TreatmentGroups = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;
export type ABGroup = ReferenceGroups | TreatmentGroups | -1 | 99;

export function toAbGroup(group: number): ABGroup {
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

class ReverseABTest extends ABTest {
    constructor(...groups: AllowedGroups[]) {
        super(...groups);
    }

    public isValid(group: ABGroup): boolean {
        return !super.isValid(group);
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

export abstract class FilteredABTest extends ABTest {
    protected static _gameId: string;
    protected static _organizationId: string | undefined;

    public static setup(gameId: string, organizationId: string | undefined) {
        FilteredABTest._gameId = gameId;
        FilteredABTest._organizationId = organizationId;
    }

    protected abstract isFiltered(): boolean;

    public isValid(group: ABGroup): boolean {
        return !this.isFiltered() && super.isValid(group);
    }
}

class ZyngaFilteredABTest extends FilteredABTest {
    protected isFiltered(): boolean {
        return FilteredABTest._organizationId === '3418765';
    }
}

class ZyngaFilteredReverseABTest extends ZyngaFilteredABTest {
    constructor(...groups: AllowedGroups[]) {
        super(...groups);
    }

    public isValid(group: ABGroup): boolean {
        return !this.isFiltered() && !super.isValid(group);
    }
}

// For Unit Testing
export const FakeEnabledABTest = new ABTest(16, 17);
export const FakeDisabledABTest = new DisabledABTest(16, 17);
export const FakeZyngaFilteredABTest = new ZyngaFilteredABTest(16, 17);
export const FakeReverseABTest = new ReverseABTest(16, 17);
export const FakeZyngaFilteredReverseABTest = new ZyngaFilteredReverseABTest(16, 17);

// Active AB Tests
export const MediationCacheModeAllowedTest = new ReverseABTest(5);
export const MabReverseABTest = new ZyngaFilteredReverseABTest(7);
export const GooglePlayDetectionTest = new ABTest(8);
export const PrivacySDKTest = new ABTest(16);
export const LoadV5NoInvalidation = new ABTest(13);
export const LoadV5 = new ReverseABTest(14, 15, 18, 19);
export const LoadV5GroupId = new ABTest(6, 10);

// Disabled AB Tests
export const OpenMeasurementTest = new DisabledABTest();
export const IframeEndcardTest = new DisabledABTest();
export const ConsentUXTest = new DisabledABTest();
