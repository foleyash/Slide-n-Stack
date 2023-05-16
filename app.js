let floor = document.getElementById("game-floor");
let base = document.getElementById("base");
var playButton = document.getElementById("play-button-start");
var titleText = document.getElementById("slide-n-stack");
var navBar = document.getElementById("nav-bar");
var instructions = document.getElementById("instructions-start");
var leaderboard = document.getElementById("leaderboard-start");

base.style.left = (getWindowWidth() / 2 - 2 * getChildWidth()) + "px";
let wave_up = true;
let wave_size = 0;
var blocksLeft = 3;
var height = 1;
var level = 1;
var platforms = [base];

var moveRight = true;
var paused = true;
var firstBlock = true;
var gameOver = false;
var gameSpeed = 150;

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

//icon features for leaderboard, instructions, and play game at start

playButton.onclick = startGame;

instructions.onclick = openInstructions;

//retrieve the width of child block, window, and border

var blockWidth = getChildWidth();
var windowWidth = getWindowWidth();
var borderWidth = getBorderWidth();

//use width of window to set side borders

setBorders();
setPlatform(blockWidth);

var moveInterval = window.setInterval(() => {
    movePlatform(blockWidth, windowWidth, borderWidth);
}, gameSpeed);

window.onresize = () => {
    blockWidth = getChildWidth();
    windowWidth = getWindowWidth();
    borderWidth = getBorderWidth();
    setBorders();
    resizePlatforms(blockWidth);
}

//EVENT LISTENERS BELOW ****

document.addEventListener("keypress", function(e) {
    e.preventDefault();
    if(paused) {
        return;
    }
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

//FUNCTION DEFINITIONS BELOW ****

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

    ++height;

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

    let last = false;
    let pos = px2num(platforms[platforms.length - 1].style.left); 
    let top = px2num(platforms[platforms.length - 1].style.top);
    let topPos = px2num(platforms[platforms.length - 2].style.left);
    let topWidth = blocksLeft * blockWidth;
    let fallingBlocks = [];
    
    firstBlock ? topWidth = 4 * blockWidth : topWidth = px2num(platforms[platforms.length - 2].style.width)
    
    if(pos === topPos) {
        if(height === 8) {
            levelUp();
        }
        else {
            setPlatform(blockWidth);
        }
        
    }
    else if (pos >= topPos + topWidth ||
            pos + topWidth <= topPos) { //blocks placed completely off of the top platform

        
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
        last = true;
        fallInterval(fallingBlocks, blockWidth, last);
       

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

        //add the extra blocks to falling blocks
        let currWidth = blocksLeft * blockWidth;
        let numFalling = (currWidth - width) / blockWidth;
        for(let i = 0; i < numFalling; i++) {
            let left = pos + i * blockWidth;

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
        fallInterval(fallingBlocks, blockWidth, last);
    }
    else if (pos > topPos) {
        //placed partially on the tail end of top

        let div = document.createElement('div');
        let diff;
        firstBlock ? diff = pos - blockWidth - topPos : diff = pos - topPos;
        div.style.position = 'absolute';
        div.style.left = pos + "px";
        div.style.top = top + "px";

        let width = blocksLeft * blockWidth - diff
        div.style.width = width + "px";
        div.style.height = blockWidth + "px";

        //add the extra blocks to falling blocks
        let currWidth = blocksLeft * blockWidth;
        let numFalling = (currWidth - width) / blockWidth;

        for(let i = 0; i < numFalling; i++) {
            let left = pos + (blocksLeft - i - 1) * blockWidth;
            let block = document.createElement('div');
            block.style.position = 'absolute';
            block.style.left = left + "px";
            block.style.top = top + "px";
            block.classList.add("child");
            block.style.height = blockWidth + "px";
            floor.appendChild(block);
            fallingBlocks.push(block);
        }

        //fill the div with correct number of child nodes and update blocksLeft
        blocksLeft = width / blockWidth;
        for(let i = 0; i < blocksLeft; i++) {
            let cell = document.createElement('div');
            cell.classList.add("child");
            div.appendChild(cell);
        }

        //remove current platform and replace with resized platform
        platforms[platforms.length - 1].remove();
        platforms[platforms.length - 1] = div;
        floor.appendChild(div);
        fallInterval(fallingBlocks, blockWidth, last);
    }
   
    
}

function fallInterval(fallingBlocks, blockWidth, last) {

    let count = 0;
    pause();
    let interval = window.setInterval(() => {

        let allDown = true;
        
        for(let i = 0; i < fallingBlocks.length; i++) {
            //get the position of the current block
           let currHeight = px2num(fallingBlocks[i].style.top);
           let currLeft = px2num(fallingBlocks[i].style.left);
          
           //get the position and width of the block right below the current block
          let nextLeft;
          let nextWidth;
          if(fallingBlocks[i].style.visibility == 'hidden') {
            continue;
          }
            
          if(platforms.length - count - 2 >= 0) {
            nextLeft = px2num(platforms[platforms.length - count - 2].style.left);
            nextWidth = px2num(platforms[platforms.length - count - 2].style.width);
          }
        
            //if at the bottom platform (special case)
            if(platforms.length - count - 2 == 0 && 
                currLeft >= nextLeft && currLeft <= nextLeft + 3 * blockWidth) {
                    let left = fallingBlocks[i].style.left;
                    let top = fallingBlocks[i].style.top;
                   fallingBlocks[i].remove();
                   fallingBlocks[i].style.visibility = 'hidden';
                   blockBreak(left, top, blockWidth);
                    continue;
            }

            //check if falling block has landed on existing platform
            if(currLeft >= nextLeft && currLeft <= nextLeft + nextWidth - blockWidth) {
                let left = fallingBlocks[i].style.left;
                let top = fallingBlocks[i].style.top;
               fallingBlocks[i].remove();
               fallingBlocks[i].style.visibility = 'hidden';
               blockBreak(left, top, blockWidth);
                continue;
            }

           //check if the current height has reached the lava
           if (currHeight >= -1 * blockWidth) {
            //creates fireball splashes once the blocks hit the lava
            let fireball = document.createElement('div');
            fireball.style.width = blockWidth / 3 + "px";
            fireball.style.height = blockWidth / 3 + "px";
            fireball.style.position = "absolute";
            fireball.style.top = "0px";
            fireball.style.left = (px2num(fallingBlocks[i].style.left) + (blockWidth /2)) + "px";
            fireball.style.background = "red";
            floor.appendChild(fireball);
            fireballPhysics(fireball);

            fallingBlocks[i].remove();
            continue;
            } 
            
            fallingBlocks[i].style.top = currHeight + blockWidth + "px";
        
            allDown = false;
        }

        if(allDown) {
            if(!last){
                if(height === 8) {
                    levelUp();
                }
                else {
                    setPlatform(blockWidth);
                    unpause(blockWidth, windowWidth, borderWidth);
                }
            
            } 
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

function blockBreak(left, top, width) {

    let block = document.createElement('div');
    block.style.position = 'absolute';
    block.style.background = 'white';
    block.style.left = left;
    block.style.top = top;
    block.style.width = width + "px";
    block.style.height = width + "px";

    floor.appendChild(block);

    window.setTimeout(() => {
        block.remove();
    }, 100)

}

function levelUp() {
    pause();
    gameSpeed -= (50 - 10*level);
    let counter = 0;
    let interval = window.setInterval(() => {

        if(counter === 6) {
            clearInterval(interval);
        }

        for(let i = 0; i < platforms.length; i++) {
            platforms[i].style.top = (px2num(platforms[i].style.top) + blockWidth) + "px";
        }

        platforms[0].remove();
        platforms.shift();
        counter++;
        height--;
    }, 400);

    setTimeout(() => {
        setPlatform(blockWidth);
        unpause(blockWidth, windowWidth, borderWidth);
    }, 2800);
    
    level++;
}

function startGame() {
    playButton.style.transition = ".5s";
    playButton.style.opacity = "0";
    instructions.style.transition = ".5s";
    instructions.style.opacity = "0";
    leaderboard.style.transition = ".5s";
    leaderboard.style.opacity = "0";

    window.setTimeout(function() {
        playButton.remove();
        instructions.remove();
        leaderboard.remove();
    }, 500);

    navBar.style.transition = ".7s ease-in-out"
    navBar.style.top = "0";
    titleText.style.transition = "1s ease-in-out";
    titleText.style.top = "3vh";
    
    setTimeout(function() {
        titleText.style.transition = "0s";
        navBar.style.transition = "0s";
    }, 1000);

    resizePlatforms(blockWidth);
    paused = false;
    
}

function openInstructions() {
    pause();
    let background = document.getElementById("instructions");
    let textBox = document.getElementById("textBox");
    let X = document.getElementById("instructionX");

    background.style.height = "50vh";
    X.style.opacity = "100";
    X.style.cursor = "pointer";

    titleText.style.opacity = "0";
    playButton.style.opacity = "0";
    leaderboard.style.opacity = "0";
    instructions.style.opacity = "0";

    setTimeout(function() {
        textBox.getElementsByTagName('h1')[0].style.opacity = "100";
        textBox.getElementsByTagName('p')[0].style.opacity = "100";
    }, 140);

    setTimeout(function() {
        textBox.getElementsByTagName('p')[1].style.opacity = "100";
    }, 220)

    X.addEventListener("click", closeInstructions);

}

function closeInstructions() {
    unpause(blockWidth, windowWidth, borderWidth);
    paused = true;

    let background = document.getElementById("instructions");
    let textBox = document.getElementById("textBox");
    let X = document.getElementById("instructionX");

    background.style.height = "0";
    X.style.opacity = "0";
    X.style.cursor = "auto";

    setTimeout(function() {
        textBox.getElementsByTagName('h1')[0].style.opacity = "0";
        textBox.getElementsByTagName('p')[0].style.opacity = "0";
        textBox.getElementsByTagName('p')[1].style.opacity = "0";
    }, 140);

    setTimeout(function() {
        titleText.style.opacity = "100";
        playButton.style.opacity = "100";
        leaderboard.style.opacity = "100";
        instructions.style.opacity = "100";
    }, 200);

    X.removeEventListener("click", closeInstructions);
}

function gameOver() {

}

function pause() {
    
    clearInterval(moveInterval); 
    paused = true;

}

function unpause(blockWidth, windowWidth, borderWidth) {
    
        moveInterval = window.setInterval(() => {
            movePlatform(blockWidth, windowWidth, borderWidth);
        }, gameSpeed);
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