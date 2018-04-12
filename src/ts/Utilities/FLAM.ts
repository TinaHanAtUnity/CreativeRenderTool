/* https://stackoverflow.com/questions/4787431/check-fps-in-js */

import { Diagnostics } from 'Utilities/Diagnostics';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class FLAM {
    public static canvas: HTMLCanvasElement = document.createElement('canvas');
    public static image: HTMLImageElement = new Image();
    public static runCount: number = 0;
    public static fpsCount: number = 0;
    public static fpsSum: number = 0;
    public static fps: number = 0;
    public static lowestFps: number = 999;
    public static highestFps: number = 0;

    public static measure(webviewContext: HTMLElement, nativeBridge: NativeBridge) {
        if (!FLAM.isImageLoaded) {
            FLAM.loadImage(true);
        }

        FLAM.prepareCanvas();

        webviewContext.appendChild(FLAM.canvas);

        FLAM.runUpdateLoop(FLAM.canvas, nativeBridge);

        //
        // nativeBridge.Storage.get(StorageType.PRIVATE, 'flam.averageFps').then(function () {
        //     console.log('I am done!', arguments);
        // });
    }

    private static get AverageFps(): number {
        return this.runCount > 0 ? Math.round(this.fpsSum / this.fpsCount) : 0;
    }

    private static get isImageLoaded(): boolean {
        return !!(this.image && this.image.complete && this.image.height > 0 && this.image.width > 0);
    }

    private static get isSupportWebP(): boolean {
        return !!(this.isImageLoaded && this.image.src && this.image.src.indexOf('image/webp;') > 0);
    }

    private static get Now(): number {
        return window.performance ? window.performance.now() : Date.now();
    }

    private static requestAnimationFrame(callback: () => any) {
        if (typeof window.requestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame(callback);
        } else if (typeof window.webkitRequestAnimationFrame !== 'undefined') {
            window.webkitRequestAnimationFrame(callback);
        } else {
            window.setInterval(callback, 1000 / 60);
        }
    }

    private static prepareCanvas() {
        /* Use css prop in js to avoid extra files */
        FLAM.canvas.style.width = '100%';
        FLAM.canvas.style.height = '50%';
        FLAM.canvas.style.top = '25%';
        FLAM.canvas.id = 'playground';
        FLAM.canvas.style.position = 'absolute';
        FLAM.canvas.style.zIndex = '999';
        FLAM.canvas.style.opacity = '0';
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

    private static runUpdateLoop(canvas: HTMLCanvasElement, nativeBridge: NativeBridge) {
        const startTime = FLAM.Now;
        const testDuration = 5 * 1000;
        const recordFPSDelay = 2 * 1000;

        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        const filterStrength = 20;
        let frameTime = 0;
        let lastLoop = FLAM.Now;
        let thisLoop;

        /* Test start */
        FLAM.requestAnimationFrame(function drawFrame() {
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

            if (FLAM.isImageLoaded) {
                FLAM.drawImages(canvas, {wobbleEffect: true});
            }

            /* Copy image data */
            // const imageData = ctx.getImageData(50, 50, 100, 100);

            /* Skipping first values, while some devices are still adjusting */
            if (startTime + recordFPSDelay < FLAM.Now) {
                FLAM.recordFPS(Math.round(1000 / frameTime));
            }

            if (startTime + testDuration < FLAM.Now) {
                FLAM.storeData(nativeBridge);
                FLAM.cleanUp();
            } else {
                FLAM.requestAnimationFrame(drawFrame);
            }
        });

        /* Test end */
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

        ctx.drawImage(FLAM.image, canvas.width / 2 - FLAM.image.width / 2, canvas.height / 2 + wobble - FLAM.image.height / 2);

        for (let i = 0; i < 500; i++) {
            ctx.save();
            ctx.rotate(360 * Math.random() * Math.PI / 180);
            ctx.scale(2 * Math.random(), 2 * Math.random());
            ctx.drawImage(FLAM.image, canvas.width / 2 * Math.random(), canvas.height * Math.random());
            ctx.restore();
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

    private static storeData(nativeBridge: NativeBridge) {
        FLAM.runCount++;

        const data = {
            runCount: FLAM.runCount,
            fpsCount: FLAM.fpsCount,
            fpsSum: FLAM.fpsSum,
            lowestFps: FLAM.lowestFps,
            highestFps: FLAM.highestFps,
            averageFps: FLAM.AverageFps,
            testVersion: '1',
            ts: new Date(),
            device: window.navigator.userAgent,
            other: `webp > ${FLAM.isSupportWebP}`
        };

        // Diagnostics.trigger('canvas_performance_test', data);
        nativeBridge.Sdk.logInfo(JSON.stringify(data));
        // nativeBridge.Storage.set(StorageType.PRIVATE, 'flam.runCount', FLAM.runCount);
        // nativeBridge.Storage.set(StorageType.PRIVATE, 'flam.averageFps', data.averageFps);
        // nativeBridge.Storage.set(StorageType.PRIVATE, 'flam.averageFps', data.averageFps);
        // nativeBridge.Storage.set(StorageType.PRIVATE, 'flam.averageFps', data.averageFps);
        // nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private static cleanUp() {
        if (FLAM.canvas && FLAM.canvas.parentElement) {
            FLAM.canvas.parentElement.removeChild(FLAM.canvas);
        }

        FLAM.canvas = document.createElement('canvas');
        FLAM.image = new Image();
    }

    private static loadImage(webp: boolean = false) {
        FLAM.image.onload = FLAM.image.onerror = () => {
            if (!FLAM.isImageLoaded && webp) {
                FLAM.image = new Image();
                FLAM.loadImage();
            }
        };

        FLAM.image.src = FLAM.getBase64Image(webp);
    }

    private static getBase64Image(webp: boolean): string {
        if (webp) {
            return 'data:image/webp;base64,UklGRr4EAABXRUJQVlA4WAoAAAAQAAAAhwAAHwAAQUxQSN8DAAABT8egbSRH7xx/1O0bgYjIy2+ZAwo5j8ycknNm9uFN9txlzTGnbJB227axNzt4Yye1bbsNatu2bdu2bdu2bSPOu37HfRo8I2i/RfR/AvRft1y3rVsyvhwtl1xLhJhcGVvkpLNfsG6UoZWIw/zpBOZkaPvhx9W5kVOM82nS+eQ2H7U+uds/Xeowc8bKa9Ob55X8X/P8PjFF02I2BGkksaHpUQ9gqqvMxdBiKHRKi/BxQzw0iC9+6VBPYKQsKydwQVGw3CJHwexGSMFcHvkLKLh516bBkmeQn2f+qXwv78hXMMTwLFDIz6Kgv+GoFB5eJdAqb8vO1WzUDxgr68Mk1JT/G176GIeidxnzos9X/PFn1BPgRYRGRt+NjHNCUuvN0dc8JI2J/l3O8Pk00Sj0evfOA+fGGyOvrJp/fE+wXXoBE2XdAjZI2oazmnGGI8YybldJAj7+hteeY3hd48Z7Eu+P6Qz1JPfbXHAz2t477pBU6pSkvMcWS/Wf5Ja0YotNekP8WFl7P+J7YUl9oJ5xkkPGEm5UjuN788BCeyF8MO8DNIyvIe5hH1guVXLSReb+hjuaSCp5ylWS9+PamrhQkvKcskdv4HR4VF0zaj6MkqRCnHSkwhRJRWPoN8AYytcgaQnfwjSXL6FG8WvqtjkZmr5MjZ/mliRfWwwDcJLMO56Gy5mqSlE8XST5vWeoxTC+hkhVEuigF6yROXm+sl0OTUaHndLkm7MivWXPaUayr7gYOlLa4hQHjcUWXSUFvGNIsnSB/Q2gpuG4XEJa0T8ZrfdIKj7t2PWBLrbQBOBks3btzXbroa+Rx7nHxTjBRWNTGvTjyzVuOYzI+6XLlBl6Ohndt8my5qW59tB4iO4p68DXfMgtqStEGiuJjZKqfk6DXF+A/jIXnF23fv26t+X+tn2smgRLUs77NtE4oK+VusBiSRugjtEKfu/eHU0aaC38ymOEPsglSXPmqORJSar9IoeOdjcC79pFk4BeVm7niSkr72e88zccuwC+HuVhVeglKfAHI4byM1AjiQ016iSyR2bfIzKrPPUrdqtksfJ9nzaTIl60z+lfev9q22gMOLtbKAKOKBzWydKt3dLNE4sX7NwopGPnIpIcLTuXKtG5lUOlOrfxMBok0sBidlMLLSwfuH/vnp0zSklS9ZXHjx0Z7mEfjQH6W2gjRPWDrlY23MsTL4tU9wlxka0HrV69/cCgWv5Szs/cvUp8KbtUSGK00t1z8OrQoDLTnMBVF7uM//amaPpTGdP5PglYJLsGBQcoHW654n481i1sk267lx64/RUQny+jMwPqjTq9zyUz8I8eAFZQOCC4AAAAcAcAnQEqiAAgAD5dJI1Fo6IhHGQAOAXEs4BmTDQD8AKcA/ACdAPsALE56AKnZ5i1Ko9StFNYg1zFXyDf0WjMESyEhAAA/vxKJxy2PF0Pn/4v/6Dv/jt//QSNDy8LMpPPJn5pn+jOv//7QjWsHvZ4aaQINLm9HuOyH+4jv//7QjbR1mUP//9M9H/dgxvMdQIYb2ox/al9UmdquGntYJr1u6/FKFpv/HB7LN2T9O2RW2Tiqnp+gAAAAA==';
        } else {
            return 'data:image/png;base64,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';
        }
    }
}
