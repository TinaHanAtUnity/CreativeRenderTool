/* https://stackoverflow.com/questions/4787431/check-fps-in-js */

import { Diagnostics } from 'Utilities/Diagnostics';
import { NativeBridge } from 'Native/NativeBridge';

export class FLAM {
    public static runCount: number = 0;
    public static fpsCount: number = 0;
    public static fpsSum: number = 0;
    public static fps: number = 0;
    public static lowestFps: number = 999;
    public static highestFps: number = 0;
    public static image: HTMLImageElement;

    private static get Now() {
        return window.performance ? window.performance.now() : Date.now();
    }

    private static get AverageFps() {
        return this.runCount > 0 ? Math.round(this.fpsSum / this.fpsCount) : 0;
    }

    public static measure(webviewContext: HTMLElement, nativeBridge: NativeBridge) {
        const canvas = FLAM.createTestCanvas();
        webviewContext.appendChild(canvas);

        FLAM.runCount++;
        FLAM.updateCanvas(canvas, nativeBridge);
    }

    private static setRAF(callback: () => any) {
        if (typeof window.requestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame(callback);
        } else if (typeof window.webkitRequestAnimationFrame !== 'undefined') {
            window.webkitRequestAnimationFrame(callback);
        } else {
            window.setInterval(callback, 1000 / 60);
        }
    }

    private static createTestCanvas(): HTMLCanvasElement {
        const canvas = <HTMLCanvasElement>document.createElement('canvas');

        /* Use css prop to avoid extra dependencies */
        canvas.style.width = '100%';
        canvas.style.height = '50%';
        canvas.style.top = '25%';
        canvas.id = 'playground';
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '999';
        // canvas.style.opacity = '0';

        return canvas;
    }

    private static recordFPS(fps: number, canvas?: HTMLCanvasElement) {
        FLAM.fps = fps;
        FLAM.fpsCount++;
        FLAM.fpsSum += FLAM.fps;

        FLAM.lowestFps = (FLAM.fps < FLAM.lowestFps) ? FLAM.fps : FLAM.lowestFps;
        FLAM.highestFps = (FLAM.fps > FLAM.highestFps) ? FLAM.fps : FLAM.highestFps;

        if (typeof canvas !== 'undefined') {
            const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

            ctx.fillStyle = 'gray';
            ctx.fillRect(0, 10, 60, 15);

            ctx.font = `15px serif`;
            ctx.fillStyle = 'yellow';
            ctx.fillText(`${(FLAM.fps)} fps`, 10, 20);
        }
    }

    private static updateCanvas(canvas: HTMLCanvasElement, nativeBridge: NativeBridge) {
        const startTime = FLAM.Now;
        const testDuration = 5 * 1000;
        const recordFPSDelay = 2 * 1000;

        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        const filterStrength = 20;
        let frameTime = 0;
        let lastLoop = FLAM.Now;
        let thisLoop;

        FLAM.loadImage();

        FLAM.setRAF(function _retry() {
            const thisFrameTime = (thisLoop = FLAM.Now) - lastLoop;
            frameTime += (thisFrameTime - frameTime) / filterStrength;
            lastLoop = thisLoop;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            FLAM.draw2dCube(canvas, {x: 0, y: canvas.height / 2.5}, {rotate: true});
            FLAM.draw2dCube(canvas, {x: 0, y: canvas.height});
            FLAM.draw2dCube(canvas, {x: canvas.width, y: canvas.height / 2.5});
            FLAM.draw2dCube(canvas, {x: canvas.width, y: canvas.height});
            FLAM.draw2dCube(canvas, {x: canvas.width / 2, y: canvas.height / 1.25}, {translate: true});
            FLAM.draw2dCube(canvas, {x: canvas.width / 2, y: canvas.height / 2}, {wobbleEffect: true});

            FLAM.drawCircle(canvas);
            FLAM.drawHeart(canvas);

            FLAM.drawImages(canvas, {wobbleEffect: true});

            /* Copy image data */
            // const imageData = ctx.getImageData(50, 50, 100, 100);

            /* Skipping first values, while some devices are still adjusting */
            if (startTime + recordFPSDelay < FLAM.Now) {
                FLAM.recordFPS(Math.round(1000 / frameTime));
            }

            if (startTime + testDuration < FLAM.Now) {
                FLAM.sendData(nativeBridge);
                FLAM.cleanUp();
            } else {
                FLAM.setRAF(_retry);
            }
        });
    }

    private static draw2dCube(canvas: HTMLCanvasElement, position: { x: number, y: number }, effect?: { wobbleEffect?: boolean, rotate?: boolean, translate?: boolean }) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        let wobble = 0;
        let translate = 0;

        if (effect && effect.wobbleEffect) {
            wobble = Math.sin(Date.now() / 250) * canvas.height / 50;
        }

        if (effect && effect.translate) {
            translate = Math.sin(Date.now() / 250) * canvas.width / 10;
        }

        const x = position.x + translate;
        const y = position.y + wobble;
        const wx = 30;
        const wy = 30;
        const h = 10;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - wx, y - wx * 0.5);
        ctx.lineTo(x - wx, y - h - wx * 0.5);
        ctx.lineTo(x, y - h);
        ctx.closePath();
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + wy, y - wy * 0.5);
        ctx.lineTo(x + wy, y - h - wy * 0.5);
        ctx.lineTo(x, y - h);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x - wx, y - h - wx * 0.5);
        ctx.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
        ctx.lineTo(x + wy, y - h - wy * 0.5);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.fill();
    }

    private static drawImages(canvas: HTMLCanvasElement, effect?: { wobbleEffect?: boolean, rotate?: boolean, translate?: boolean }) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        let wobble = 0;

        if (effect && effect.wobbleEffect) {
            wobble = Math.sin(Date.now() / 250) * canvas.height / 50;
        }

        if (FLAM.image.complete) {

            ctx.drawImage(FLAM.image, canvas.width / 2 - FLAM.image.width / 2, canvas.height / 2 + wobble - FLAM.image.height / 2);

            for (let i = 0; i < 500; i++) {
                ctx.save();
                ctx.rotate(360 * Math.random() * Math.PI / 180);
                ctx.scale(2 * Math.random(), 2 * Math.random());
                ctx.drawImage(FLAM.image, canvas.width / 2 * Math.random(), canvas.height * Math.random());
                ctx.restore();
            }
        }
    }

    private static drawCircle(canvas: HTMLCanvasElement) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.arc(canvas.width * Math.random(), canvas.height * Math.random(), 50, 0, Math.PI * 2);
        ctx.stroke();
    }

    private static drawHeart(canvas: HTMLCanvasElement) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.moveTo(canvas.width * Math.random(), canvas.height * Math.random());
        ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
        ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
        ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
        ctx.fill();

    }

    private static sendData(nativeBridge: NativeBridge) {
        const data = {
            runCount: FLAM.runCount,
            fpsCount: FLAM.fpsCount,
            fpsSum: FLAM.fpsSum,
            lowestFps: FLAM.lowestFps,
            highestFps: FLAM.highestFps,
            averageFps: FLAM.AverageFps,
            other: FLAM.Now,
            score: 0,
            testType: '',
            testVersion: 3,
            device: window.navigator.userAgent,
        };

        // Diagnostics.trigger('canvas_performance_test', data);
        nativeBridge.Sdk.logInfo(JSON.stringify(data));
    }

    private static cleanUp() {
        /* Clean up */
    }

    private static loadImage() {
        if (typeof FLAM.image === 'undefined') {
            FLAM.image = new Image();
            FLAM.image.src = FLAM.getBase64Image();
        }
    }

    private static getBase64Image(): string {
        return 'data:image/png;base64,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';
    }

}
