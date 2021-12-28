const fileInput = <HTMLInputElement>document.getElementById("fileInput");
const isGrayscale = <HTMLInputElement>document.getElementById('grayscale');
const isInverted = <HTMLInputElement>document.getElementById('invert');
const contrastValue = document.getElementById('contrast-slider');
const brightness = document.getElementById('brightness-input');
const red = document.getElementById('red-slider');
const green = document.getElementById('green-slider');
const blue = document.getElementById('blue-slider');
const blurSlider = document.getElementById('blur-slider');
const flipHorizontal = document.getElementById('flip-horizontal');
const flipVertical = document.getElementById('flip-vertical');

function main(): void {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = document.body.clientWidth - 240;
    canvas.height = document.body.clientHeight;

    const srcImage = new Image();
    let originalImageData: ImageData = undefined;

    fileInput.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        // might have to revoke this each time i load a new a image
        srcImage.src = URL.createObjectURL(files[0]);
    }, false);

    srcImage.addEventListener('load', () => {
        ctx.drawImage(srcImage, canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2);
        originalImageData = ctx.getImageData(canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2, srcImage.width, srcImage.height);
    }, false);

    red.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        alterRedChannel(originalImageData.data, Number(target.value))
        drawImage(originalImageData, canvas, ctx);
    });

    blue.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        alterGreenChannel(originalImageData.data, Number(target.value))
        drawImage(originalImageData, canvas, ctx);
    });

    green.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        alterGreenChannel(originalImageData.data, Number(target.value))
        drawImage(originalImageData, canvas, ctx);
    });

    brightness.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        alterBrightness(originalImageData.data, Number(target.value));
        drawImage(originalImageData, canvas, ctx);
    });

    flipHorizontal.onclick = () => {
        flipH(originalImageData.data);
        drawImage(originalImageData, canvas, ctx);
    };

    flipVertical.onclick = () => {
        flipV(originalImageData);
        drawImage(originalImageData, canvas, ctx);
    };
}

function updateInput(val, id) {
    // document.getElementById(`${id}`).value = val;
}

function grayscale(imageData: Uint8ClampedArray): void {
    for (let i = 0; i < imageData.length; i += 4) {
        const avg = imageData[i] * 0.2126 + imageData[i + 1] * 0.7152 + imageData[i + 2] * 0.0722;
        imageData[i] = avg;
        imageData[i + 1] = avg;
        imageData[i + 2] = avg;
    }
}

function invert(imageData: Uint8ClampedArray): void {
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = 255 - imageData[i];
        imageData[i + 1] = 255 - imageData[i + 1];
        imageData[i + 2] = 255 - imageData[i + 2];
    }
}

function alterChannel(imageData: Uint8ClampedArray, channel: 0 | 1 | 2, amount: number): void {
    for (let i = channel; i < imageData.length; i += 4) {
        imageData[i] = clamp(imageData[i] + amount);
    }
}

function alterRedChannel(imageData: Uint8ClampedArray, amount: number): void {
    alterChannel(imageData, 0, amount)
}

function alterGreenChannel(imageData: Uint8ClampedArray, amount: number): void {
    alterChannel(imageData, 1, amount)
}

function alterBlueChannel(imageData: Uint8ClampedArray, amount: number): void {
    alterChannel(imageData, 2, amount)
}

function alterBrightness(imageData: Uint8ClampedArray, brightness: number): void {
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = clamp(brightness + imageData[i]);
        imageData[i + 1] = clamp(brightness + imageData[i + 1]);
        imageData[i + 2] = clamp(brightness + imageData[i + 2]);
    }
}

function alterContrast(imageData: Uint8ClampedArray, brightness: number): void {
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = brightness + imageData[i];
        imageData[i + 1] = brightness + imageData[i + 1];
        imageData[i + 2] = brightness + imageData[i + 2];
    }
}

function flipH(imageData: Uint8ClampedArray): void {
    let firstPointer = 0;
    let lastPointer = imageData.length - 1;
    for (let i = 0; i < imageData.length; i += 4) {
        const TOP_RED = imageData[firstPointer];
        const TOP_GREEN = imageData[firstPointer + 1];
        const TOP_BLUE = imageData[firstPointer + 2];
        const TOP_ALPHA = imageData[firstPointer + 3];

        const BOTTOM_RED = imageData[lastPointer];
        const BOTTOM_GREEN = imageData[lastPointer + 1];
        const BOTTOM_BLUE = imageData[lastPointer + 2];
        const BOTTOM_ALPHA = imageData[lastPointer + 3];

        imageData[firstPointer] = BOTTOM_RED;
        imageData[firstPointer + 1] = BOTTOM_GREEN;
        imageData[firstPointer + 2] = BOTTOM_BLUE;
        imageData[firstPointer + 3] = BOTTOM_ALPHA;

        imageData[lastPointer - 3] = TOP_RED;
        imageData[lastPointer - 2] = TOP_GREEN;
        imageData[lastPointer - 1] = TOP_BLUE;
        imageData[lastPointer] = TOP_ALPHA;

        firstPointer++;
        lastPointer++;
    }
}

function flipV(image: ImageData): void {
    const imageData = image.data;
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width / 2; x++) {
            const leftIndex = getPixelIndex(image, x, y);
            const rightIndex = getPixelIndex(image, image.width - x, y) - 1;

            const LEFT_RED = imageData[leftIndex];
            const LEFT_GREEN = imageData[leftIndex + 1];
            const LEFT_BLUE = imageData[leftIndex + 2];
            const LEFT_ALPHA = imageData[leftIndex + 3];

            const RIGHT_ALPHA = imageData[rightIndex];
            const RIGHT_BLUE = imageData[rightIndex - 1];
            const RIGHT_GREEN = imageData[rightIndex - 2];
            const RIGHT_RED = imageData[rightIndex - 3];

            imageData[leftIndex] = RIGHT_RED;
            imageData[leftIndex + 1] = RIGHT_GREEN;
            imageData[leftIndex + 2] = RIGHT_BLUE;
            imageData[leftIndex + 3] = RIGHT_ALPHA;

            imageData[rightIndex - 3] = LEFT_RED;
            imageData[rightIndex - 2] = LEFT_GREEN;
            imageData[rightIndex - 1] = LEFT_BLUE;
            imageData[rightIndex] = LEFT_ALPHA;
        }
    }

}

function rotate90DegRight(imageData: Uint8ClampedArray): void { }
function rotate90DegLeft(imageData: Uint8ClampedArray): void { }

function getPixelIndex(imageData: ImageData, x: number, y: number): number {
    return (x + y * imageData.width) * 4;
}

function clamp(value: number): number {
    return Math.max(0, Math.min(Math.floor(value), 255))
}

function drawImage(imageData: ImageData, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.putImageData(imageData, canvas.width / 2 - imageData.width / 2, canvas.height / 2 - imageData.height / 2);
}

main();

// function runPipeline(): void {
//     let imageDataClone = new Uint8ClampedArray(originalImageData.data);
//     // ctx.fillStyle = "#171719";
//     // ctx.fillRect(0, 0, canvas.width, canvas.height);
//     if (isGrayscale.checked) {
//         grayscale(imageDataClone);
//     }

//     if (isInverted.checked) {
//         invert(imageDataClone);
//     }

//     // ctx.putImageData(imageData, canvas.width / 2 - imageData.width / 2, imageData.height / 2 - imageData.height / 2);
//     const newImageData = new ImageData(
//         imageDataClone,
//         originalImageData.width,
//         originalImageData.height
//     )
//     ctx.putImageData(newImageData, canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2);
// }

// export default function urltoImage(url: string): Promise<HTMLImageElement> {
//     return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.onload = () => resolve(img);
//         img.onerror = () => reject(new Error('urltoImage(): Image failed to load, please check the image URL'));
//         img.src = url;
//     });
// };