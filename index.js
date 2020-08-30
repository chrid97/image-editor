const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;

canvas.width = document.body.clientWidth - 240;
canvas.height = document.body.clientHeight;

const srcImage = new Image();
let imgData = undefined;
let originalImageData = undefined;

// const srcImage = loadImageFromUrl(src);
// const src = "https://unsplash.it/640/480/?image=808";
// const src = "https://placekitten.com/100/100";

const fileInput = document.getElementById('fileInput');
const grayscaleCheckbox = document.getElementById('grayscale');
const invertCheckbox = document.getElementById('invert');
const contrastValue = document.getElementById('contrast-slider');
const brightness = document.getElementById('brightness-input');
const red = document.getElementById('red-slider');
const green = document.getElementById('green-slider');
const blue = document.getElementById('blue-slider');
const blur = document.getElementById('blur-slider');

fileInput.onchange = (event) => {
    if (event.target.files && event.target.files.item(0)) {
        srcImage.src = URL.createObjectURL(event.target.files[0]);
    }
}

function loadImageFromUrl(url) {
    const image = new Image();
    image.crossOrigin = 'Anyonymous';
    image.src = url;

    return image;
}

function updateInput(val, id) {
    document.getElementById(`${id}`).value = val;
    runPipeline();
}

function getPixelIndex(x, y) {
    return (x + y * imgData.width) * 4;
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

function customBoxBlur(imageData, blur) {
    for(let y = 0; y < srcImage.height; y++) {
        for(let x = 0; x < srcImage.width; x++) {
            getPixelIndex(x, y);
        }
    }

    return imageData;
}

function addColor(data, value, colorOffset) {
    for(let i = 0; i < data.length; i += 4) {
        data[i + colorOffset] = clamp(data[i + colorOffset] + value);
    } 

    return data;
}

function setGrayscale(data) {
    for(let i = 0; i < data.length; i += 4) {
        const avg = data[i]*0.2126 + data[i + 1]*0.7152 + data[i + 2]*0.0722;
        data[i]     = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    return data;
}

function invertColors(data) {
    for(let i = 0; i < data.length; i += 4) {
        data[i]     = clamp(255 - data[i]); // red
        data[i + 1] = clamp(255 - data[i + 1]); // green
        data[i + 2] = clamp(255 - data[i + 2]); // blue
    }
    return data;
}

function changeBrightness(imageData, brightness) {
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i]    = clamp(imageData[i] + brightness);
        imageData[i + 1]= clamp(imageData[i + 1] + brightness);
        imageData[i + 2]= clamp(imageData[i + 2] + brightness);
    }

    return imageData;
}

// add later
function setSepia(imgData) {}

function contrast(imageData, contrastValue) {
    return imageData;
}

function getImageData(image) {
    return ctx.getImageData(0, 0, image.width, image.height);
}

function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255))
}

srcImage.addEventListener('load', () => {
    ctx.drawImage(srcImage, canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2);
    imgData = ctx.getImageData(canvas.width / 2 - srcImage.width / 2, canvas.height / 2 - srcImage.height / 2, srcImage.width, srcImage.height);

    originalImageData = imgData.data.slice();
}, false);

function runPipeline() {
    let newImage = originalImageData.slice();
    if(grayscaleCheckbox.checked) {
        newImage = setGrayscale(newImage);
    }

    if(invertCheckbox.checked) {
        newImage = invertColors(newImage);
    }
    
    const brightnessFilter = Number(brightness.value);
    newImage = changeBrightness(newImage, brightnessFilter);
    
    const redFilter = Number(red.value);
    newImage = addColor(newImage, redFilter, R_OFFSET);

    const greenFilter = Number(green.value);
    newImage = addColor(newImage, greenFilter, G_OFFSET);

    const blueFilter = Number(blue.value);
    newImage = addColor(newImage, blueFilter, B_OFFSET);

    const contrastFilter = Number(contrast.value);
    newImage = contrast(newImage, contrastFilter);

    const blurFilter = Number(blur.value);
    newImage = customBoxBlur(newImage, blurFilter);


    if(horizontalFlip) {
        for(let x = 0; x < srcImage.width; x++) {
            for(let y = 0; y < srcImage.height / 2; y++) {
                const topIndex = getPixelIndex(x, y);
                const bottomIndex = getPixelIndex(srcImage.width - x, srcImage.height - y) - 1;

                const TOP_RED = newImage[topIndex];
                const TOP_GREEN = newImage[topIndex + 1]; 
                const TOP_BLUE =  newImage[topIndex + 2];
                const TOP_ALPHA = newImage[topIndex + 3];

                const BOTTOM_ALPHA = newImage[bottomIndex];
                const BOTTOM_BLUE = newImage[bottomIndex - 1];
                const BOTTOM_GREEN = newImage[bottomIndex - 2];
                const BOTTOM_RED = newImage[bottomIndex - 3];

                newImage[topIndex] = BOTTOM_RED; 
                newImage[topIndex + 1] = BOTTOM_GREEN; 
                newImage[topIndex + 2] = BOTTOM_BLUE; 
                newImage[topIndex + 3] = BOTTOM_ALPHA; 

                newImage[bottomIndex - 3] = TOP_RED;
                newImage[bottomIndex - 2] = TOP_GREEN; 
                newImage[bottomIndex - 1] = TOP_BLUE; 
                newImage[bottomIndex] = TOP_ALPHA; 
            }
        }
    }

    if(verticalFlip) {
        for(let y = 0; y < srcImage.height; y++) {
            for(let x = 0; x < srcImage.width/ 2; x++) {
                const leftIndex = getPixelIndex(x, y);
                const rightIndex = getPixelIndex(srcImage.width - x, y) - 1;

                const LEFT_RED = newImage[leftIndex]; 
                const LEFT_GREEN = newImage[leftIndex + 1]; 
                const LEFT_BLUE =  newImage[leftIndex + 2];
                const LEFT_ALPHA = newImage[leftIndex + 3];

                const RIGHT_ALPHA = newImage[rightIndex];
                const RIGHT_BLUE = newImage[rightIndex - 1];
                const RIGHT_GREEN = newImage[rightIndex - 2];
                const RIGHT_RED = newImage[rightIndex - 3]; 

                newImage[leftIndex] = RIGHT_RED; 
                newImage[leftIndex + 1] = RIGHT_GREEN; 
                newImage[leftIndex + 2] = RIGHT_BLUE; 
                newImage[leftIndex + 3] = RIGHT_ALPHA; 

                newImage[rightIndex - 3] = LEFT_RED;
                newImage[rightIndex - 2] = LEFT_GREEN; 
                newImage[rightIndex - 1] = LEFT_BLUE; 
                newImage[rightIndex] = LEFT_ALPHA; 
            }
        }
    }

    if(isRotatedRight) {
        for(let y = 0; y < srcImage.height; y++) {
            for(let x = 0; x < srcImage.width / 2; x++) {
                const leftIndex = getPixelIndex(x, y);
            }
        }
    }

    for (let i = 0; i < imgData.data.length; i++) {
        imgData.data[i] = newImage[i]
    }

    ctx.putImageData(imgData, canvas.width / 2 - imgData.width / 2, canvas.height / 2 -imgData.height / 2);
}

let horizontalFlip = false;
let verticalFlip = false;
let isRotatedRight = false;

function flipHorizontal() {
    horizontalFlip = !horizontalFlip; 

    runPipeline();
}

function flipVertical() {
    verticalFlip = !verticalFlip; 

    runPipeline();
}

function rotateLeft() {}

function rotateRight() {
    isRotatedRight = !isRotatedRight;

    runPipeline();
}

const sliderLabels = document.getElementsByClassName('slider-label');
Array.from(sliderLabels).forEach((element) => {
    const originalElementInnerText = element.innerText;

    element.addEventListener('mouseover', (event) => {
        const lowerCaseString = originalElementInnerText.toLowerCase();
        const value = Number(document.getElementById(`${lowerCaseString}-slider`).value);
        if(value > 0 || value < 0) {
            element.innerText = 'Reset';
        }
    });

    element.addEventListener('mouseout', (event) => {
        element.innerText = originalElementInnerText;
    });

    element.onclick = (event) => {
        const lowerCaseString = originalElementInnerText.toLowerCase();
        const value = Number(document.getElementById(`${lowerCaseString}-slider`).value);
        if(value > 0 || value < 0) {
            updateInput(0, `${lowerCaseString}-slider`);          
            updateInput(0, `${lowerCaseString}-input`);          
            runPipeline();
        }
    }
});

document.getElementById('canvas').addEventListener('wheel', () => {
    console.log('hey');
});
