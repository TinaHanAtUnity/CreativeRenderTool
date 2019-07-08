export enum VastCompanionAdType {
    STATIC = 'static',
    IFRAME = 'iframe',  // IFrame, HTML support WIP
    HTML = 'html'
}

export interface IVastCreativeCompanionAd {
    id: string | null;          // id is not a requirement per iab spec
    type: VastCompanionAdType;  // Unity internal type classification
    width: number;
    height: number;
}
