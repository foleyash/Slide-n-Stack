let lava = document.getElementById("game-floor");
let wave_up = true;
let wave_size = 0;

let interval = window.setInterval(function() {
    if(wave_up) {
        wave_size++;
        let percent = 50 + wave_size;
        lava.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
        if(wave_size >= 20) {
            wave_up = false;
        }
    }
    else {
        wave_size--;
        let percent = 50 + wave_size;
        lava.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
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

window.onresize = () => {
    setBorders();
}


//FUNCTION DEFINITION BELOW ****

function getWindowWidth() {
    return window.innerWidth;
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
    while(width < getWindowWidth() - getChildWidth()) {
        blocks++;
        width = width + getChildWidth();
    }

    return blocks;
}

function setBorders() {
    let blocks = blocksInWindow();
    let width = blocks * getChildWidth();

    let borderWidth = getWindowWidth() - width;
    
    let leftBorder = document.getElementById("left-border");
    let rightBorder = document.getElementById("right-border");
    leftBorder.style.width = borderWidth + "px";
    rightBorder.style.width = borderWidth + "px";
}