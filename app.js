let floor = document.getElementById("game-floor");
let wave_up = true;
let wave_size = 0;
var blocksLeft = 3;
var height = 2;
var platforms = [];
var moveRight = true;

let interval = window.setInterval(function() {
    if(wave_up) {
        wave_size++;
        let percent = 40 + wave_size;
        floor.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
        if(wave_size >= 20) {
            wave_up = false;
        }
    }
    else {
        wave_size--;
        let percent = 40 + wave_size;
        floor.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
        if(wave_size <= -20) {
            wave_up = true;
        }
    }
}, 50);

//retrieve the width of the base div

let baseWidth = getBaseWidth();

//retrieve the width of child block

let childWidth = getChildWidth();

//use width of window to set side borders

setBorders();
setPlatform();
//movePlatform();

window.onresize = () => {
    setBorders();
    resizePlatforms();
}

//FUNCTION DEFINITION BELOW ****

function getWindowWidth() {
    return document.body.clientWidth;
}

function getBaseWidth() {
    let base = document.getElementById('base');
    let divWidth = getComputedStyle(base).width;

    if(divWidth.length == 5) {
        divWidth = divWidth.substring(0, 3);
    }
    else {
        divWidth = divWidth.substring(0,2);
    }

    let width = Number(divWidth);

    return width;
}

function getChildWidth() {
    let childrenBlocks = document.getElementsByClassName("child");
    let childWidth = getComputedStyle(childrenBlocks[0]).width;

    if(childWidth.length == 5) {
        childWidth = childWidth.substring(0, 3);
    }
    else {
        childWidth = childWidth.substring(0,2);
    }

    let width = Number(childWidth);

    return width;
}

function blocksInWindow() {
    let blocks = 0;
    let width = 0;
    while(width <= (getWindowWidth()/2) - 2 * getChildWidth()) {
        blocks++;
        width = width + getChildWidth();
    }

    blocks = (blocks * 2) + 2;

    return blocks;
}

function setBorders() {
    let borderWidth = getBorderWidth(); 

    let leftBorder = document.getElementById("left-border");
    let rightBorder = document.getElementById("right-border");

    leftBorder.style.width = borderWidth + "px";
    rightBorder.style.width = borderWidth + "px";
}

function getBorderWidth() {
    let blocks = blocksInWindow();
    let width = blocks * getChildWidth();

    let borderWidth = (getWindowWidth() - width) / 2;

    return borderWidth;
}


function setPlatform() {
    let container = document.createElement('div');
    container.style.position = "absolute";
    container.style.width = (getChildWidth()*blocksLeft) + "px";
    container.style.height = getChildWidth() + "px";
    container.style.top = (-1 * height * getChildWidth()) + "px";
    let borderWidth = getBorderWidth();
    container.style.left = borderWidth + "px";

    for(let i = 0; i < blocksLeft; i++) {
        let cell = document.createElement('div');
        cell.classList.add('child');
        container.appendChild(cell);
    }

    height++;

    floor.appendChild(container);
    platforms.push(container);

}

function resizePlatforms() {
    for(let i = 0; i < platforms.length; i++) {
        platforms[i].style.height = getChildWidth() + "px";
        platforms[i].style.width = (getChildWidth()*blocksLeft) + "px";
        platforms[i].style.top = (-1 * (i + 2) * getChildWidth()) + "px";
        let borderWidth = getBorderWidth();
        platforms[i].style.left = borderWidth + "px";
    }
}

function movePlatform() {
    var moveInterval = window.setInterval(() => {
        let pos = px2num(platforms[platforms.length - 1].style.left);
        if(pos + 4 * getChildWidth() <= (getWindowWidth() - getBorderWidth()) && moveRight) {
            //continue moving right
            platforms[platforms.length - 1].style.left = (pos + getChildWidth()) + "px";
            console.log("Continue moving right");
        }
        else if (pos + 4 * getChildWidth() > getWindowWidth() - getBorderWidth() && moveRight) {
            //swap direction to left
            platforms[platforms.length - 1].style.left = (pos - getChildWidth()) + "px";
            moveRight = false;
            console.log("Swap to left");
        }
        else if (pos - getChildWidth() >= getBorderWidth() - 10 && !moveRight) {
            //continue moving left
            platforms[platforms.length - 1].style.left = (pos - getChildWidth()) + "px";
            console.log("Continue moving left");
        }
        else if (pos - getChildWidth() < getBorderWidth() && !moveRight) {
            //swap direction to right
            platforms[platforms.length - 1].style.left = (pos + getChildWidth()) + "px";
            moveRight = true;
            console.log("Swap to right");
        }
       
        

    }, 200);
}

function px2num (str) {
    
    if(str.length == 5) {
        str = str.substring(0, 3);
    }
    else {
        str = str.substring(0,2);
    }

    let num = Number(str);

    return num;
}

//TESTING FUNCTIONS BELOW ****

function setTestBlocks() {
    let testBlocks = document.getElementById("test-blocks");
    let blocks = blocksInWindow();
    let width = blocks * getChildWidth();
    let borderWidth = (getWindowWidth() - width) / 2;
    
    testBlocks.style.height = getChildWidth() + "px";
    testBlocks.style.width = width + "px";
    testBlocks.style.left = borderWidth + "px";
}

function fillTestBlocks() {

    let testBlocks = document.getElementById("test-blocks");
    let blocks = blocksInWindow();

    if(testBlocks.hasChildNodes()) {
        while(testBlocks.firstChild) {
            testBlocks.removeChild(testBlocks.lastChild);
        }
    }
    
    for(let i = 0; i < blocks; i++) {
        let div = document.createElement('div');
        div.classList.add('child');
        testBlocks.appendChild(div);
    }
}