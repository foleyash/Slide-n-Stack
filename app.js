let floor = document.getElementById("game-floor");
let pauseButton = document.getElementById("pause");
let base = document.getElementById("base");
base.style.left = (getWindowWidth() / 2 - 2 * getChildWidth()) + "px";
let wave_up = true;
let wave_size = 0;
var blocksLeft = 3;
var height = 2;
var platforms = [base];
var moveRight = true;
var paused = false;
var firstBlock = true;

let lavaInterval = window.setInterval(function() {
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

//retrieve the width of child block, window, and border

let blockWidth = getChildWidth();
let windowWidth = getWindowWidth();
let borderWidth = getBorderWidth();

//use width of window to set side borders

setBorders();
setPlatform(blockWidth);

var moveInterval = window.setInterval(() => {
    movePlatform(blockWidth, windowWidth, borderWidth);
}, 200);

window.onresize = () => {
    let blockWidth = getChildWidth();
    let windowWidth = getWindowWidth();
    let borderWidth = getBorderWidth();
    setBorders();
    resizePlatforms(blockWidth);
    pause();
}

document.addEventListener("keypress", function(e) {
    e.preventDefault();
    if(e.keycode == 32 ||
        e.code == "Space" ||
        e.key == " "
        ) {
        
        dropPlatform(firstBlock, blockWidth);
        if(firstBlock) {
            firstBlock = false;
        }
        
    }
    
});

pauseButton.addEventListener("click", () => {
    
    !paused ? pause() : unpause();
    
}); 

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


function setPlatform(blockWidth) {
    let container = document.createElement('div');
    container.style.position = "absolute";
    container.style.width = (blockWidth*blocksLeft) + "px";
    container.style.height = blockWidth + "px";
    container.style.top = (-1 * height * blockWidth) + "px";
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

function resizePlatforms(childWidth) {
    for(let i = 0; i < platforms.length; i++) {
        if(i == 0) {
            platforms[i].style.left = (getWindowWidth() / 2 - 2 * childWidth) + "px";
            continue;
        }
        platforms[i].style.height = childWidth + "px";
        platforms[i].style.width = (childWidth*blocksLeft) + "px";
        platforms[i].style.top = (-1 * (i + 1) * childWidth) + "px";
        let borderWidth = getBorderWidth();
        platforms[i].style.left = borderWidth + "px";
    }
}

function movePlatform(blockWidth, windowWidth, borderWidth) {

        let pos = px2num(platforms[platforms.length - 1].style.left);
        if(pos + (1 + blocksLeft) * blockWidth <= (windowWidth - borderWidth) && moveRight) {
            //continue moving right
            platforms[platforms.length - 1].style.left = (pos + blockWidth) + "px";
        }
        else if (pos + (1 + blocksLeft) * blockWidth > (windowWidth - borderWidth) && moveRight) {
            //swap direction to left
            platforms[platforms.length - 1].style.left = (pos - blockWidth) + "px";
            moveRight = false;
        }
        else if (pos - blockWidth >= borderWidth && !moveRight) {
            //continue moving left
            platforms[platforms.length - 1].style.left = (pos - blockWidth) + "px";      
        }
        else if (pos - blockWidth < borderWidth && !moveRight) {
            //swap direction to right
            platforms[platforms.length - 1].style.left = (pos + blockWidth) + "px";
            moveRight = true;
        }

}

function dropPlatform(firstBlock, blockWidth) {

    let pos = px2num(platforms[platforms.length - 1].style.left); 
    let top = px2num(platforms[platforms.length - 1].style.top);
    let topPos = px2num(platforms[platforms.length - 2].style.left);
    let topWidth;
    
    firstBlock ? topWidth = 4 * blockWidth : topWidth = px2num(platforms[platforms.length - 2].style.width);

    //console.log("Base: " + topPos);
    //console.log("New: " + pos);
    //console.log("Width: " + topWidth);
    
    if(pos === topPos) {
        console.log("perfect drop!");
        setPlatform(blockWidth);
    }
    else if (pos >= topPos + blocksLeft * blockWidth ||
            pos + blocksLeft * blockWidth <= topPos) {

        let fallingBlocks = [];
        for(let i = 0; i < blocksLeft; i++) {
            let container = document.createElement('div');
            container.style.position = "absolute";
            container.style.height = blockWidth + "px";
            container.style.width = blocksLeft * blockWidth + "px";
            container.style.left = pos + i * blockWidth + "px";
            container.style.top = top + "px";
            let cell = document.createElement('div');
            cell.classList.add("child");
            container.appendChild(cell);
            floor.appendChild(container);
            fallingBlocks.push(container);
        }
        platforms[platforms.length - 1].remove();
        fallInterval(fallingBlocks, blockWidth);

    }
    else if(pos < topPos) {
        //placed partially on the front end of top

        //create a new div on top of stack, resized to the correct amount of blocks
        let div = document.createElement('div');
       
        div.style.position = 'absolute';
        let diff = topPos - pos;
        div.style.left = (pos + diff) + "px";
        div.style.top = top + "px";
        let width = blocksLeft * blockWidth - Math.abs(diff);
        div.style.width = width + "px";
        div.style.height = blockWidth + "px";
        
        

        //fill the div with correct number of child nodes and update blocksLeft
        blocksLeft = width / blockWidth;
        for(let i = 0; i < blocksLeft; i++) {
            let cell = document.createElement('div');
            cell.classList.add("child");
            div.appendChild(cell);
        }

        platforms[platforms.length - 1].remove();
        platforms[platforms.length - 1] = div;
        floor.appendChild(div);
        setPlatform(blockWidth);
    }
    else if (pos > topPos) {
        //placed partially on the tail end of top

        let div = document.createElement('div');
        let diff;
        firstBlock ? diff = pos - blockWidth - topPos: diff = pos - topPos;
        div.style.position = 'absolute';
        div.style.left = pos + "px";
        div.style.top = top + "px";

        let width = blocksLeft * blockWidth - diff
        div.style.width = width + "px";
        div.style.height = blockWidth + "px";

        //fill the div with correct number of child nodes and update blocksLeft
        blocksLeft = width / blockWidth;
        for(let i = 0; i < blocksLeft; i++) {
            let cell = document.createElement('div');
            cell.classList.add("child");
            div.appendChild(cell);
        }

        platforms[platforms.length - 1].remove();
        platforms[platforms.length - 1] = div;
        floor.appendChild(div);
        setPlatform(blockWidth);
    }
   
    
    
}

function fallInterval(fallingBlocks, blockWidth) {

    let count = 0;
    let interval = window.setInterval(() => {

        let allDown = true;
        
        for(let i = 0; i < fallingBlocks.length; i++) {
           let currHeight = px2num(fallingBlocks[i].style.top);
            let topHeight;
           /* if(platforms[platforms.length - 1 - count] != 'NaN' && platforms[platforms.length - 1 - count] != null 
            && platforms[platforms.length - 1 - count] != '') {
                topHeight = px2num(platforms[platforms.length - 1 - count].style.top);
            } 
            else {
                topHeight = -1 * blockWidth;
            } */

            if(currHeight >= topHeight - blockWidth &&
                fallingBlocks[i].style.left == platforms[platforms.length - 1 - count].style.left) {
                    if(fallingBlocks[i]) {
                        fallingBlocks[i].remove();
                    }
                    continue;
                } 
            else if (currHeight >= -1 * blockWidth) {
                //creates fireball splashes once the blocks hit the lava
                let fireball = document.createElement('div');
                fireball.style.width = blockWidth / 3 + "px";
                fireball.style.height = blockWidth / 3 + "px";
                fireball.style.position = "absolute";
                fireball.style.top = "0px";
                fireball.style.left = fallingBlocks[i].style.left;
                fireball.style.background = "red";
                floor.appendChild(fireball);
                fireballPhysics(fireball);
                console.log(fireball.style.top);
                console.log(fireball.style.left);

                fallingBlocks[i].remove();
                continue;
            }


            fallingBlocks[i].style.top = currHeight + blockWidth + "px";
            allDown = false;
        }

        if(allDown) {
            clearInterval(interval);
        }

        count++;
    }, 100);
}

function fireballPhysics(fireball) {
    let time = 50; //milliseconds
    let up = true; //tracks whether the fireball is moving up or down
    let interval = window.setInterval(() => {
        if(time == 120) {
            up = false;
        }

        if(px2num(fireball.style.top) >= 0 && !up) {
            fireball.remove();
            clearInterval(interval);
        }
        if(up) {
            fireball.style.top = px2num(fireball.style.top) - 12 + "px";
            time = time + 7
        }
        else {
            fireball.style.top = px2num(fireball.style.top) + 12 + "px";
            time = time - 7;
        }
        
    }, time)
}

function gameOver() {

}

function pause() {
 
    clearInterval(moveInterval);  
    paused = true;
}

function unpause() {
    moveInterval = window.setInterval(() => {
        movePlatform(blockWidth, windowWidth, borderWidth);
    }, 200);
    paused = false;
}

function px2num (str) {

    let ans = "";
    for(c in str) {
        if(str[c] == 'p') {
            //end of number, break out
            break;
        }

        ans+=str[c];
    }

    let num = Number(ans);

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