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
export const HeartbeatingDownloadButtonTest = new ZyngaFilteredABTest(5);
export const BlinkingDownloadButtonTest = new ZyngaFilteredABTest(6);
export const BouncingDownloadButtonTest = new ZyngaFilteredABTest(7);
export const ShiningDownloadButtonTest = new ZyngaFilteredABTest(8);
export const LoadRefreshV3 = new ABTest(12);
export const ZyngaLoadExperimentWithCometRefreshing = new ABTest(13, 14); // Equivalent test to group 15, but only on Zynga WWF Titles
export const ZyngaLoadExperiment =  new ABTest(15, 16);
export const LoadExperiment = new ABTest(12, 15, 16, 17); // Intentionally left 12, 15, and 17 to not backwards break experiment
export const LoadExperimentWithCometRefreshing = new ABTest(15); // Intentionally duplicate ABGroup 15
export const LoadExperimentWithCometRefreshingAfterAnyStart = new ABTest(17); // Intentionally duplicate ABGroup 16
export const ConsentUXTest = new ABTest(18, 19);
