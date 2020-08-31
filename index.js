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
let newImage = undefined;

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

function customBoxBlur(imageData, blur) {}

function addColor(currentPixelIndex, value, colorOffset) {
    newImage[currentPixelIndex + colorOffset] = clamp(newImage[currentPixelIndex + colorOffset] + value);
}

function setGrayscale(currentPixelIndex) {
    const avg = newImage[currentPixelIndex]*0.2126 + newImage[currentPixelIndex + 1]*0.7152 + newImage[currentPixelIndex + 2]*0.0722;
    newImage[currentPixelIndex]     = avg; // red
    newImage[currentPixelIndex + 1] = avg; // green
    newImage[currentPixelIndex + 2] = avg; // blue
}

function invertColors(currentPixelIndex) {
    newImage[currentPixelIndex]     = clamp(255 - newImage[currentPixelIndex]); // red
    newImage[currentPixelIndex + 1] = clamp(255 - newImage[currentPixelIndex + 1]); // green
    newImage[currentPixelIndex + 2] = clamp(255 - newImage[currentPixelIndex + 2]); // blue
}

function changeBrightness(currentPixelIndex, brightness) {
    newImage[currentPixelIndex]    = clamp(newImage[currentPixelIndex] + brightness);
    newImage[currentPixelIndex + 1]= clamp(newImage[currentPixelIndex + 1] + brightness);
    newImage[currentPixelIndex + 2]= clamp(newImage[currentPixelIndex + 2] + brightness);
}

// add later
function setSepia(imgData) {}

function contrast(imageData, contrastValue) {}

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
    newImage = originalImageData.slice();
    
    for(let y = 0; y < srcImage.height; y++)  {
        for(let x = 0; x < srcImage.width; x++) {
            currentIndex = getPixelIndex(x, y);

            if(grayscaleCheckbox.checked) {
                setGrayscale(currentIndex);
            }

            if(invertCheckbox.checked) {
                invertColors(currentIndex);
            }

            const redFilter = Number(red.value);
            addColor(currentIndex, redFilter, R_OFFSET);

            const greenFilter = Number(green.value);
            addColor(currentIndex, greenFilter, G_OFFSET);

            const blueFilter = Number(blue.value);
            addColor(currentIndex, blueFilter, B_OFFSET); 

            const brightnessFilter = Number(brightness.value);
            changeBrightness(currentIndex, brightnessFilter);

            const contrastFilter = Number(contrast.value);
            contrast(currentIndex, contrastFilter);

            const blurFilter = Number(blur.value);
            customBoxBlur(currentIndex, blurFilter);
        }
    }


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
