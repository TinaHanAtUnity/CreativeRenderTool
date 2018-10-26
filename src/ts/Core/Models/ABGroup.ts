
export class ABGroup {

    private _abGroup: number;

    constructor(abGroup: number) {
        this._abGroup = abGroup;
    }

    public toNumber(): number {
        return this._abGroup;
    }
}

const GroupNone = new ABGroup(-1);
const GroupZero = new ABGroup(0);
const GroupOne = new ABGroup(1);
const GroupTwo = new ABGroup(2);
const GroupThree = new ABGroup(3);
const GroupFour = new ABGroup(4);
const GroupFive = new ABGroup(5);
const GroupSix = new ABGroup(6);
const GroupSeven = new ABGroup(7);
const GroupEight = new ABGroup(8);
const GroupNine = new ABGroup(9);
const GroupTen = new ABGroup(10);
const GroupEleven = new ABGroup(11);
const GroupTwelve = new ABGroup(12);
const GroupThirteen = new ABGroup(13);
const GroupFourteen = new ABGroup(14);
const GroupFifteen = new ABGroup(15);
const GroupSixteen = new ABGroup(16);
const GroupSeventeen = new ABGroup(17);
const GroupEighteen = new ABGroup(18);
const GroupNineteen = new ABGroup(19);
const GroupTest = new ABGroup(99);
export const GroupDisabled = new ABGroup(666);

export class ABGroupBuilder {
    public static getAbGroup = (group: number) => {
        switch (group) {
            case 0:
                return GroupZero;
            case 1:
                return GroupOne;
            case 2:
                return GroupTwo;
            case 3:
                return GroupThree;
            case 4:
                return GroupFour;
            case 5:
                return GroupFive;
            case 6:
                return GroupSix;
            case 7:
                return GroupSeven;
            case 8:
                return GroupEight;
            case 9:
                return GroupNine;
            case 10:
                return GroupTen;
            case 11:
                return GroupEleven;
            case 12:
                return GroupTwelve;
            case 13:
                return GroupThirteen;
            case 14:
                return GroupFourteen;
            case 15:
                return GroupFifteen;
            case 16:
                return GroupSixteen;
            case 17:
                return GroupSeventeen;
            case 18:
                return GroupEighteen;
            case 19:
                return GroupNineteen;
            case 99:
                return GroupTest;
            default:
                return GroupNone;
        }
    }
}

class ABTest {
    private _groups: ABGroup[];

    constructor(...groups: ABGroup[]) {
        this._groups = groups;
    }

    public isValid(group: ABGroup): boolean {
        return this._groups.indexOf(group) !== -1;
    }
}

// Add ABTests below
// Example : export const GdprBaseAbTest = new ABTest(GroupSixteen, GroupSeventeen);

export const FPSCollectionTest = new ABTest(GroupSixteen);
export const ClickDelayTrackingTest = new ABTest(GroupFourteen, GroupFifteen);
export const PerformanceVideoOverlayCTAButtonTest = new ABTest(GroupEighteen, GroupNineteen);
export const AuctionV5Test = new ABTest(GroupTest);
