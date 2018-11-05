import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

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
    private static readonly ANDROID_AR_SUPPORTED_RETRY_WAIT = 300;

    public static calculateVideoScale(frameInfo: IARFrameInfo): IARFrameScale {
        let videoRect: IARRect = {x: 0, y: 0, width: frameInfo.videoSize.width, height: frameInfo.videoSize.height};
        videoRect = ARUtil.transformRect(videoRect, ARUtil.invertTransform(frameInfo.transform));

        // Calculate scaling for aspect fill
        const videoAspectRatio = videoRect.width / videoRect.height;
        const drawableAspectRatio = frameInfo.drawableSize.width / frameInfo.drawableSize.height;

        let dstWidth = frameInfo.drawableSize.width;
        let dstHeight = frameInfo.drawableSize.height;

        if(drawableAspectRatio > videoAspectRatio) {
            dstHeight *= drawableAspectRatio * (1 / videoAspectRatio);
        } else {
            dstWidth *= (1 / drawableAspectRatio) * videoAspectRatio;
        }

        return {
            scaleX: dstWidth / videoRect.width,
            scaleY: dstHeight / videoRect.height
        };
    }

    public static advanceFrameWithScale(api: IosARApi): Promise<void> {
        // Get frame info, calculate scaling and then call advanceFrame
        return api.getFrameInfo().then((frameInfo) => {
            const scale = ARUtil.calculateVideoScale(frameInfo);
            return api.setFrameScaling(scale).then(
                () => api.advanceFrame().catch(
                (error) => { throw new Error('Cannot set frame scale ' + error); })
            );
        }).catch((error) => { throw new Error('Cannot get frame info ' + error); });
    }

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

    public static isARSupported(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.AR.Ios ? nativeBridge.AR.Ios.isARSupported() :
            nativeBridge.AR.Android ? ARUtil.isARSupportedAndroid(nativeBridge.AR.Android) :
                Promise.resolve<boolean>(false);
    }

    private static isARSupportedAndroid(api: AndroidARApi, retry: number = 1): Promise<boolean> {
        if (retry > 5) {
            return Promise.resolve<boolean>(false);
        }

        return api.isARSupported().then(([transient, supported]) => {
            if (!transient) {
                return supported;
            }

            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            return sleep(this.ANDROID_AR_SUPPORTED_RETRY_WAIT).then(() => {
                return ARUtil.isARSupportedAndroid(api, retry + 1);
            });
        });
    }
}
