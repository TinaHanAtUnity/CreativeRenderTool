import { Vector3 } from 'Performance/Utilities/Vector3';

const degToRad = Math.PI / 180; // Degree-to-Radian conversion

export class Quaternion {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public copy(q: Quaternion): void {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
    }

    public clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    public multiply(q: Quaternion): void {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z, w } = this;
        const { x: qx, y: qy, z: qz, w: qw } = q;
        this.x = w * qx + x * qw + y * qz - z * qy;
        this.y = w * qy - x * qz + y * qw + z * qx;
        this.z = w * qz + x * qy - y * qx + z * qw;
        this.w = w * qw - x * qx - y * qy - z * qz;
    }

    public inverse(): void {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z, w } = this;
        const d = x * x + y * y + z * z + w * w;
        this.x = -x / d;
        this.y = -y / d;
        this.z = -z / d;
        this.w = w / d;
    }

    public normalize(): void {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z, w } = this;
        const d = Math.sqrt(x * x + y * y + z * z + w * w);
        this.x = x / d;
        this.y = y / d;
        this.z = z / d;
        this.w = w / d;
    }

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
    public fromAxisAngle(vec: Vector3, radAngle: number): void {
        const angle = radAngle / 2;
        const s = Math.sin(angle);

        this.x = vec.x * s;
        this.y = vec.y * s;
        this.z = vec.z * s;
        this.w = Math.cos(angle);
    }

    // http://w3c.github.io/deviceorientation
    public fromGyro(alpha: number, beta: number, gamma: number): void {
        const _x = beta ? beta * degToRad : 0;
        const _z = alpha ? alpha * degToRad : 0;
        const _y = gamma ? gamma * degToRad : 0;

        const cX = Math.cos(_x / 2);
        const cY = Math.cos(_y / 2);
        const cZ = Math.cos(_z / 2);
        const sX = Math.sin(_x / 2);
        const sY = Math.sin(_y / 2);
        const sZ = Math.sin(_z / 2);

        // ZXY quaternion construction.
        this.x = sX * cY * cZ - cX * sY * sZ;
        this.y = cX * sY * cZ + sX * cY * sZ;
        this.z = cX * cY * sZ + sX * sY * cZ;
        this.w = cX * cY * cZ - sX * sY * sZ;
    }

    public dot(q: Quaternion): number {
        return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
    }

    public lerp(q: Quaternion, t: number): void {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z, w } = this;
        let { x: qx, y: qy, z: qz, w: qw } = q;

        if (this.dot(q) < 0) {
            qx *= -1;
            qy *= -1;
            qz *= -1;
            qw *= -1;
        }

        const tI = 1 - t;
        this.x = x * tI + qx * t;
        this.y = y * tI + qy * t;
        this.z = z * tI + qz * t;
        this.w = w * tI + qw * t;
    }

    public nlerp(q: Quaternion, t: number): void {
        this.lerp(q, t);
        this.normalize();
    }
}
