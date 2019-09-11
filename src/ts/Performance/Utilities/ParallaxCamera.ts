import { Quaternion } from 'Performance/Utilities/Quaternion';
import { Vector3 } from 'Performance/Utilities/Vector3';

export class ParallaxCamera {
    private _initialAlpha: number;
    private _alpha: number;
    private _beta: number;
    private _gamma: number;
    private _orientation: number;

    private _deviceorientationListener: EventListener;
    private _orientationchangeListener: EventListener;

    private _cameraQuat: Quaternion;
    private _orientationUpdated: boolean;
    private _orientationFixQuat: Quaternion;
    private _referencePointQuat: Quaternion;
    private _referencePointQuatInv: Quaternion;
    private _baseQuat: Quaternion;
    private _orientationQuat: Quaternion;
    private _referencePoint: Vector3;
    private _baseVector: Vector3;
    private _rotatedPoint: Vector3;
    private _maxAngle: number;

    constructor(maxAngle: number) {
        this._maxAngle = maxAngle;
        this._alpha = 0;
        this._beta = 0;
        this._gamma = 0;
        this._cameraQuat = new Quaternion(0, 0, 0, 1);
        this._orientationFixQuat = new Quaternion(0, 0, 0, 1);
        this._baseQuat = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
        this._orientationQuat = new Quaternion(0, 0, 0, 1);
        this._referencePointQuat = new Quaternion(0, 0, 0, 1);
        this._referencePointQuatInv = new Quaternion(0, 0, 0, 1);
        this._referencePoint = new Vector3(0, 0, 0);
        this._baseVector = new Vector3(0, 0, 1);
        this._rotatedPoint = new Vector3(0, 0, 1);
        this._orientationUpdated = false;

        this._deviceorientationListener = (event: Event) => this.handleDeviceOrientation(<DeviceOrientationEvent>event);
        this._orientationchangeListener = () => this.handleOrientationChange();
    }

    private handleDeviceOrientation(event: DeviceOrientationEvent): void {
        // cache events for the update method
        this._alpha = event.alpha || 0;
        this._beta = event.beta || 0;
        this._gamma = event.gamma || 0;

        // Android uses absolute alpha whereas iOS uses relative. Use inital alpha to convert absolute alpha to relative.
        // Otherwise, the parallax effect would not be centered at the start on Android
        if (!this._initialAlpha) {
            this._initialAlpha = this._alpha;
        }
        this._alpha -= this._initialAlpha;
        if (this._alpha < 0) {
            this._alpha += 360;
        }
        this._orientationUpdated = true;
    }

    private handleOrientationChange(): void {
        const { orientation } = window;

        if (typeof orientation === 'number') {
            this._orientation = orientation;
        } else if (orientation === 'portrait-primary') {
            this._orientation = 0;
        } else if (orientation === 'portrait-secondary') {
            this._orientation = 180;
        } else if (orientation === 'landscape-primary') {
            this._orientation = 90;
        } else if (orientation === 'landscape-secondary') {
            this._orientation = -90;
        } else {
            this._orientation = 0;
        }

        this._orientationFixQuat.fromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 180 * this._orientation);
    }

    public load(): void {
        this.handleOrientationChange();

        window.addEventListener('deviceorientation', this._deviceorientationListener, false);
        window.addEventListener('orientationchange', this._orientationchangeListener, false);
    }

    public unload(): void {
        window.removeEventListener('deviceorientation', this._deviceorientationListener, false);
        window.removeEventListener('orientationchange', this._orientationchangeListener, false);
    }

    public position(): Vector3 {
        return this._rotatedPoint;
    }

    public maxAngle(): number {
        return this._maxAngle;
    }

    public update(): void {
        // don't use if browser (without gyros) or if we haven't got orientation event.
        // Running update without gyro data would cause reference point to rotate to a wrong position
        if (!this._orientationUpdated) {
            return;
        }

        // reset rotation
        this._cameraQuat.copy(this._baseQuat);

        // get quaternion for the current device orientation
        this._orientationQuat.fromGyro(this._alpha, this._beta, this._gamma);
        this._cameraQuat.multiply(this._orientationQuat);

        // finally correct the rotation if the device is in landscape mode or upside down
        this._cameraQuat.multiply(this._orientationFixQuat);

        // get unit vector's coordinates rotated by device orientation quaternion
        this._rotatedPoint.copy(this._baseVector);
        this._rotatedPoint.applyQuaternion(this._cameraQuat);

        this._referencePoint.copy(this._baseVector);
        this._referencePoint.applyQuaternion(this._referencePointQuat);

        // angle between reference point and rotated point,
        // using vectors discards the rotation around z axis (device turned sideways)
        const angle = Math.abs(this._referencePoint.angleTo(this._rotatedPoint));

        // if the rotated point / camera is too far away from the reference point,
        // rotate the reference point to force the rotated point / camera into allowed area
        if (angle > this._maxAngle) {
            const eff = 1 - this._maxAngle / angle;
            this._referencePointQuat.nlerp(this._cameraQuat, eff);
            this._referencePointQuatInv.copy(this._referencePointQuat);
            this._referencePointQuatInv.inverse();
        }

        this._rotatedPoint.applyQuaternion(this._referencePointQuatInv);
        this._orientationUpdated = false;
    }
}
