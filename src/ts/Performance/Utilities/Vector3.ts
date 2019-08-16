import { Quaternion } from 'Performance/Utilities/Quaternion';

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public copy(vector: Vector3): void {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public length(): number {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z } = this;
        return Math.sqrt(x * x + y * y + z * z);
    }

    public dot(vector: Vector3): number {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    // Use formula p' = qpq* to calculate new vector p' from vector p rotated by a quaternion q, where q* is quoternion conjugate
    public applyQuaternion(q: Quaternion): void {
        //tslint:disable-next-line:no-this-assignment
        const { x, y, z } = this;
        const { x: qx, y: qy, z: qz, w: qw } = q;

        // qp part, w = 0 for vector p
        const xq =   x * qw - y * qz + z * qy;
        const yq =   x * qz + y * qw - z * qx;
        const zq = - x * qy + y * qx + z * qw;
        const wq = - x * qx - y * qy - z * qz;

        // multiply qp by q*, q* = w - x - y - z
        this.x = - wq * qx + xq * qw - yq * qz + zq * qy;
        this.y = - wq * qy + xq * qz + yq * qw - zq * qx;
        this.z = - wq * qz - xq * qy + yq * qx + zq * qw;
    }

    public angleTo(vector: Vector3): number {
        const theta = this.dot(vector) / (this.length() * vector.length());
        return Math.acos(Math.min(Math.max(theta, -1), 1));
    }

    public azimuth() {
        return Math.atan(this.x / this.z);
    }
}
