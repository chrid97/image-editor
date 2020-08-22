const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const R_OFFSET = 0;
const B_OFFSET = 1;
const G_OFFSET = 2;

canvas.width = document.body.clientWidth - 240;
canvas.height = 1000;

let imgData = undefined;

const src = "https://unsplash.it/640/480/?image=808";

const grayscale = document.getElementById('grayscale');
const invertCheckbox = document.getElementById('invert');

function updateInput(val, id) {
    document.getElementById(`${id}`).value = val;
    runPipeline();
}

function loadImage(url) {
    const image = new Image();
    image.crossOrigin = 'Anyonymous';
    image.src = url;

    return image;
}

function getPixelIndex(x, y) {
    return (x + y * imgData.width) * 4;
}

function setGrayscale(imageData) {
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4) {
        // const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const avg = data[i]*0.2126 + data[i + 1]*0.7152 + data[i + 2]*0.0722;
        data[i]     = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    return imageData;
}

function invertColors(imageData) {
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4) {
        data[i]     = 255 - data[i]; // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
    return imageData;
}

function boxBlur(imageData) {
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const center = getPixelIndex(x, y);
            const top = getPixelIndex(x, y + 1);
            const bottom = getPixelIndex(x, y - 1);
            const right = getPixelIndex(x + 1, y);
            const left = getPixelIndex(x - 1, y);
            const topRight = getPixelIndex(x + 1, y + 1);
            const topLeft = getPixelIndex(x - 1, y + 1);
            const bottomRight = getPixelIndex(x + 1, y - 1);
            const bottomLeft = getPixelIndex(x - 1, y - 1);

            function blur(pos) {
                const sum = data[center+pos] + data[top+pos] + data[bottom+pos] + 
                            data[right+pos] + data[left+pos] + data[topRight+pos] + 
                            data[topLeft+pos] + data[bottomRight+pos] + data[bottomLeft+pos];

                data[center+pos] = sum / 9;
            }

            blur(0);
            blur(1);
            blur(2);
        }

    }
    return imageData;
}

function centerOffset(x, y, yOffset = 0, xOffset = 0) {
    return getPixelIndex(x + xOffset, y + yOffset);
}

function customBoxBlur(imageData, strength) {
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            
            function blur(offset) {
                let sum = 0;
                for(let my = 0; my <= strength; my++) {
                    for(let mx = 0; mx <= strength; mx++) {
                        const index = getPixelIndex(x + mx, y + my);
                        const index2 = getPixelIndex(x - mx, y - my);

                        sum += (data[index + offset] + data[index2 + offset]);
                    }
                }
                data[getPixelIndex(x,y) + offset] = sum / 9;
            }

            blur(0);
            blur(1);
            blur(2);
        }
    }
    return imageData;
}

function addRed() {}

function addColor(x, y, value, imageData, offset) {
    const index = getPixelIndex(x, y) + offset;
    imageData.data = 10;
}

function changeBrightness(imageData, brightness) {
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const redIndex = getPixelIndex(x, y);
            const greenIndex = getPixelIndex(x, y) + 1;
            const blueIndex = getPixelIndex(x, y) + 2;

            data[redIndex]   = clamp(data[redIndex] + brightness);
            data[greenIndex] = clamp(data[greenIndex] + brightness);
            data[blueIndex]  = clamp(data[blueIndex] + brightness);
            
        }
    }
    return imageData;
}

function getImageData(image) {
    return ctx.getImageData(0, 0, image.width, image.height);
}

function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255))
}

const srcImage = loadImage(src);

// const brightnessFilter = Number(brightness.value);

srcImage.addEventListener('load', () => {
    // ctx.drawImage(srcImage, canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2);
    ctx.drawImage(srcImage, 0, 0);
    imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height);
    // const newImage = boxBlur(getImageData(image));
    // ctx.putImageData(newImage, 685, 0);
    // const grayscaleImage = customBoxBlur(getImageData(image), 1);
    // ctx.putImageData(grayscaleImage, 0, 500);
    // const bright = changeBrightness(getImageData(image), 100);
    // ctx.putImageData(bright, 0, 500);
}, false);

function runPipeline() {
    let newImage = imgData;
    if(grayscale.checked) {
        newImage = setGrayscale(imgData);
    }

    if(invertCheckbox.checked) {
        newImage = invertColors(imgData);
    }
    
    const brightness = document.getElementById('brightness-input').value;
    newImage = changeBrightness(newImage, brightness);
        // ctx.putImageData(newImage, canvas.width / 2 - newImage.width / 2, canvas.height / 2 - newImage.height / 2);
    ctx.putImageData(newImage, 0, 0);
}
