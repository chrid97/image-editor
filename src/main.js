var fileInput = document.getElementById("fileInput");
var isGrayscale = document.getElementById('grayscale');
var isInverted = document.getElementById('invert');
var contrastValue = document.getElementById('contrast-slider');
var brightness = document.getElementById('brightness-input');
var red = document.getElementById('red-slider');
var green = document.getElementById('green-slider');
var blue = document.getElementById('blue-slider');
var blurSlider = document.getElementById('blur-slider');
var flipHorizontal = document.getElementById('flip-horizontal');
var flipVertical = document.getElementById('flip-vertical');
function main() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = document.body.clientWidth - 240;
    canvas.height = document.body.clientHeight;
    var srcImage = new Image();
    var originalImageData = undefined;
    fileInput.addEventListener('change', function (event) {
        var target = event.target;
        var files = target.files;
        // might have to revoke this each time i load a new a image
        srcImage.src = URL.createObjectURL(files[0]);
    }, false);
    srcImage.addEventListener('load', function () {
        ctx.drawImage(srcImage, canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2);
        originalImageData = ctx.getImageData(canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2, srcImage.width, srcImage.height);
    }, false);
    red.addEventListener('input', function (event) {
        var target = event.target;
        alterRedChannel(originalImageData.data, Number(target.value));
        drawImage(originalImageData, canvas, ctx);
    });
    blue.addEventListener('input', function (event) {
        var target = event.target;
        alterGreenChannel(originalImageData.data, Number(target.value));
        drawImage(originalImageData, canvas, ctx);
    });
    green.addEventListener('input', function (event) {
        var target = event.target;
        alterGreenChannel(originalImageData.data, Number(target.value));
        drawImage(originalImageData, canvas, ctx);
    });
    brightness.addEventListener('input', function (event) {
        var target = event.target;
        alterBrightness(originalImageData.data, Number(target.value));
        drawImage(originalImageData, canvas, ctx);
    });
    flipHorizontal.onclick = function () {
        flipH(originalImageData.data);
        drawImage(originalImageData, canvas, ctx);
    };
    flipVertical.onclick = function () {
        flipV(originalImageData);
        drawImage(originalImageData, canvas, ctx);
    };
}
function updateInput(val, id) {
    // document.getElementById(`${id}`).value = val;
}
function grayscale(imageData) {
    for (var i = 0; i < imageData.length; i += 4) {
        var avg = imageData[i] * 0.2126 + imageData[i + 1] * 0.7152 + imageData[i + 2] * 0.0722;
        imageData[i] = avg;
        imageData[i + 1] = avg;
        imageData[i + 2] = avg;
    }
}
function invert(imageData) {
    for (var i = 0; i < imageData.length; i += 4) {
        imageData[i] = 255 - imageData[i];
        imageData[i + 1] = 255 - imageData[i + 1];
        imageData[i + 2] = 255 - imageData[i + 2];
    }
}
function alterChannel(imageData, channel, amount) {
    for (var i = channel; i < imageData.length; i += 4) {
        imageData[i] = clamp(imageData[i] + amount);
    }
}
function alterRedChannel(imageData, amount) {
    alterChannel(imageData, 0, amount);
}
function alterGreenChannel(imageData, amount) {
    alterChannel(imageData, 1, amount);
}
function alterBlueChannel(imageData, amount) {
    alterChannel(imageData, 2, amount);
}
function alterBrightness(imageData, brightness) {
    for (var i = 0; i < imageData.length; i += 4) {
        imageData[i] = clamp(brightness + imageData[i]);
        imageData[i + 1] = clamp(brightness + imageData[i + 1]);
        imageData[i + 2] = clamp(brightness + imageData[i + 2]);
    }
}
function alterContrast(imageData, brightness) {
    for (var i = 0; i < imageData.length; i += 4) {
        imageData[i] = brightness + imageData[i];
        imageData[i + 1] = brightness + imageData[i + 1];
        imageData[i + 2] = brightness + imageData[i + 2];
    }
}
function flipH(imageData) {
    var firstPointer = 0;
    var lastPointer = imageData.length - 1;
    for (var i = 0; i < imageData.length; i += 4) {
        var TOP_RED = imageData[firstPointer];
        var TOP_GREEN = imageData[firstPointer + 1];
        var TOP_BLUE = imageData[firstPointer + 2];
        var TOP_ALPHA = imageData[firstPointer + 3];
        var BOTTOM_RED = imageData[lastPointer];
        var BOTTOM_GREEN = imageData[lastPointer + 1];
        var BOTTOM_BLUE = imageData[lastPointer + 2];
        var BOTTOM_ALPHA = imageData[lastPointer + 3];
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
function flipV(image) {
    var imageData = image.data;
    for (var y = 0; y < image.height; y++) {
        for (var x = 0; x < image.width / 2; x++) {
            var leftIndex = getPixelIndex(image, x, y);
            var rightIndex = getPixelIndex(image, image.width - x, y) - 1;
            var LEFT_RED = imageData[leftIndex];
            var LEFT_GREEN = imageData[leftIndex + 1];
            var LEFT_BLUE = imageData[leftIndex + 2];
            var LEFT_ALPHA = imageData[leftIndex + 3];
            var RIGHT_ALPHA = imageData[rightIndex];
            var RIGHT_BLUE = imageData[rightIndex - 1];
            var RIGHT_GREEN = imageData[rightIndex - 2];
            var RIGHT_RED = imageData[rightIndex - 3];
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
function rotate90DegRight(imageData) { }
function rotate90DegLeft(imageData) { }
function getPixelIndex(imageData, x, y) {
    return (x + y * imageData.width) * 4;
}
function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255));
}
function drawImage(imageData, canvas, ctx) {
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
