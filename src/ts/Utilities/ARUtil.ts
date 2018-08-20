import { MRAIDCampaign } from '../Models/Campaigns/MRAIDCampaign';

export interface IARFrameTransform {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
}

export interface IARFrameScale {
    scaleX: number;
    scaleY: number;
    transform?: IARFrameTransform;
}

export interface IARSize {
    width: number;
    height: number;
}

export interface IARFrameInfo {
    transform: IARFrameTransform;
    videoSize: IARSize;
    drawableSize: IARSize;
    interfaceOrientation: number;
}

export interface IARPoint {
    x: number;
    y: number;
}

export interface IARRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class ARUtil {
    public static invertTransform(transform: IARFrameTransform): IARFrameTransform {
        const t = transform;
        const determinant = t.a * t.d - t.b * t.c;
        if (determinant === 0) {
            return transform;
        }
        const invDet = 1 / determinant;

        return {
            a: t.d * invDet,
            b: -t.b * invDet,
            c: -t.c * invDet,
            d: t.a * invDet,
            tx: (t.c * t.ty - t.d * t.tx) * invDet,
            ty: (t.b * t.tx - t.a * t.ty) * invDet
        };
    }

    public static transformPoint(point: IARPoint, t: IARFrameTransform): IARPoint {
        return {
            x: t.a * point.x + t.c * point.y + t.tx,
            y: t.b * point.x + t.d * point.y + t.ty
        };
    }

    public static transformRect(rect: IARRect, t: IARFrameTransform): IARRect {
        const top = rect.y;
        const left = rect.x;
        const right = rect.x + rect.width;
        const bottom = rect.y + rect.height;

        const topLeft = ARUtil.transformPoint({x: left, y: top}, t);
        const topRight = ARUtil.transformPoint({x: right, y: top}, t);
        const bottomLeft = ARUtil.transformPoint({x: left, y: bottom}, t);
        const bottomRight = ARUtil.transformPoint({x: right, y: bottom}, t);

        const minX = Math.min(Math.min(topLeft.x, topRight.x), Math.min(bottomLeft.x, bottomRight.x));
        const maxX = Math.max(Math.max(topLeft.x, topRight.x), Math.max(bottomLeft.x, bottomRight.x));
        const minY = Math.min(Math.min(topLeft.y, topRight.y), Math.min(bottomLeft.y, bottomRight.y));
        const maxY = Math.max(Math.max(topLeft.y, topRight.y), Math.max(bottomLeft.y, bottomRight.y));

        return {
            x: minX, y: minY, width: maxX - minX, height: maxY - minY
        };
    }

    // TODO: Remove /ar/ folder check once we have MRAID-AR type support on the server side
    public static isARCreative(campaign: MRAIDCampaign): boolean {
        if (campaign.getAdType() && campaign.getAdType() === 'MRAID_AR') {
            return true;
        }

        const resourceUrl = campaign.getResourceUrl();
        if (resourceUrl && resourceUrl.getOriginalUrl().match(/\/ar\/|ducktales-ar/)) {
            return true;
        }

        const arCreatives = ['102044637'];
        let isAR = false;
        arCreatives.forEach(c => {
            if (c === campaign.getCreativeId()) {
                isAR = true;
            }
        });

        return isAR;
    }
}
