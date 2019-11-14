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

// for unit tests
export const FakeEnabledABTest = new ABTest(16, 17);
export const FakeDisabledABTest = new DisabledABTest(16, 17);
export const FakeZyngaFilteredABTest = new ZyngaFilteredABTest(16, 17);

// Add actual A/B tests below
export const OpenMeasurementTest = new DisabledABTest();
export const IframeEndcardTest = new DisabledABTest();
export const HtmlEndcardTest = new DisabledABTest();
export const ConsentUXTest = new ABTest(18, 19);
export const HeartbeatingDownloadButtonTest = new ABTest(7);
export const BouncingDownloadButtonTest = new ABTest(8);
export const ShiningDownloadButtonTest = new ABTest(15);
export const MabDecisionButtonTest = new ABTest(17);

// Load ABTests based on https://docs.google.com/spreadsheets/d/1-vtxnqIZ4FVusloKj4ZhaOtydSYNyk4BiQDI0Xny4qk/edit#gid=1252380516
export const LoadExperiment = new ABTest(5, 6, 12, 16);
export const LoadRefreshV4 = new ABTest(5, 6);
export const ZyngaLoadRefreshV4 = new ABTest(5, 6, 12, 13, 14);
