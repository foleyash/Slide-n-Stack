let floor = document.getElementById("game-floor");
let base = document.getElementById("base");
var playButton = document.getElementById("play-button-start");
var titleText = document.getElementById("slide-n-stack");
var navBar = document.getElementById("nav-bar");
var instructions = document.getElementById("instructions-start");
var leaderboard = document.getElementById("leaderboard-start");
var restartButton = document.getElementById("restart-button");

//hide overflow in the window
document.body.style.overflow = "hidden";

base.style.left = (getWindowWidth() / 2 - 2 * getChildWidth()) + "px";
let wave_up = true;
let wave_size = 0;
var blocksLeft = 3;
var height = 1;
var level = 1;
var extraPlatforms = 0;
var gameSpeed = 150;
var platforms = [base];
var colorPercent = 20;

var moveRight = true;
var paused = false;
var firstBlock = true;
var gameOver = false;
var newHighScore = false;
var loadScreen = true;

setLeaderboardText();

//user authentication local variables
var username = "";
var loggedIn = false;
var highLevel = 1;
var highPlatforms = 0;
var viewedPortal = false;

var loginForm = document.getElementById("login-form");
var registerForm = document.getElementById("sign-in-form");

var loginButton = document.getElementById("register-portal").getElementsByTagName("a")[1];
var loginButton2 = document.getElementById("login-button-container").getElementsByTagName("a")[0];

var closeLoginPortalButton = document.getElementById("login-portal").getElementsByTagName("a")[0];
var closeRegisterPortalButton = document.getElementById("register-portal").getElementsByTagName("a")[0];

var forgotPassButton = document.getElementById("login-portal").getElementsByTagName("a")[1];

var signUpButton = document.getElementById("login-portal").getElementsByTagName("a")[2];
var signUpButton2 = document.getElementById("login-button-container").getElementsByTagName("a")[1];

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

//populate the leaderboard with the top 25 scores upon loading the page
getTopScores();

//retrieve the width of child block, window, and border

var blockWidth = getChildWidth();
var windowWidth = getWindowWidth();
var borderWidth = getBorderWidth();

//use width of window to set side borders

setBorders(borderWidth);
setPlatform(blockWidth, borderWidth);

//start moving the platform from right to left
var moveInterval = window.setInterval(() => {
    movePlatform(blockWidth, windowWidth, borderWidth);
}, gameSpeed);


// **** EVENT LISTENERS BELOW ****

//icon features for leaderboard, instructions, and play game at start

playButton.addEventListener("click", startGame, false);

instructions.addEventListener("click", openInstructions, false);

restartButton.addEventListener("click", restartGame, false);

leaderboard.addEventListener("click", openLeaderboard, false);

closeLoginPortalButton.onclick = closeLoginPortal;

closeRegisterPortalButton.onclick = closeRegisterPortal;

signUpButton.onclick = openRegisterPortal;

signUpButton2.onclick = openRegisterPortal;

loginButton.onclick = openLoginPortal;

loginButton2.onclick = openLoginPortal;

loginForm.onsubmit = attemptLogin;

registerForm.onsubmit = attemptRegister;

window.onresize = () => {
    
    if(paused) {
        blockWidth = getChildWidth();
        windowWidth = getWindowWidth();
        borderWidth = getBorderWidth();
        setBorders(borderWidth);
        resizePlatforms(blockWidth, borderWidth);
    } else {
        pause();
        blockWidth = getChildWidth();
        windowWidth = getWindowWidth();
        borderWidth = getBorderWidth();
        setBorders(borderWidth);
        resizePlatforms(blockWidth, borderWidth);
        unpause(blockWidth, windowWidth, borderWidth);
    }

    setLeaderboardText();
    
}

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

function setBorders(borderWidth) {

    let leftBorder = document.getElementById("left-border");
    let rightBorder = document.getElementById("right-border");

    if(borderWidth <= 6) {
        leftBorder.style.border = "none";
        rightBorder.style.border = "none"
       leftBorder.style.background = "white";
        rightBorder.style.background = "white";
    } 
    else {
        leftBorder.style.border = "3px white solid";
        rightBorder.style.border = "3px white solid";
        leftBorder.style.background = "black";
        rightBorder.style.background = "black";
    } 

    leftBorder.style.width = borderWidth + "px";
    rightBorder.style.width = borderWidth + "px";
} 

function getBorderWidth() {
    let blocks = blocksInWindow();
    let width = blocks * getChildWidth();

    let borderWidth = (getWindowWidth() - width) / 2;

    return borderWidth;
}

function onSpaceBar(e) {

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
}

function setPlatform(blockWidth, borderWidth) {

    ++height;

    let container = document.createElement('div');
    container.style.position = "absolute";
    container.style.width = (blockWidth*blocksLeft) + "px";
    container.style.height = blockWidth + "px";
    container.style.top = (-1 * height * blockWidth) + "px";
    container.style.left = borderWidth + "px";

    for(let i = 0; i < blocksLeft; i++) {
        let cell = document.createElement('div');
        cell.classList.add('child');
        container.appendChild(cell);
    }

    floor.appendChild(container);
    platforms.push(container);

}

function resizePlatforms(childWidth, borderWidth) {
    for(let i = 0; i < platforms.length; i++) {
        if(i == 0) {
            platforms[i].style.left = (getWindowWidth() / 2 - 2 * childWidth) + "px";
            continue;
        }
        platforms[i].style.height = childWidth + "px";
        platforms[i].style.width = (childWidth*blocksLeft) + "px";
        platforms[i].style.top = (-1 * (i + 1) * childWidth) + "px";
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

async function dropPlatform(firstBlock, blockWidth) {

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
            setPlatform(blockWidth, borderWidth);
        }
        
        updateScore();
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

async function fallInterval(fallingBlocks, blockWidth, last) {

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
                currLeft >= nextLeft && currLeft <= nextLeft + 3 * blockWidth &&
                level == 1) {
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
                    setPlatform(blockWidth, borderWidth);
                    unpause(blockWidth, windowWidth, borderWidth);
                }
                
                updateScore();
            }
            else {
                //remove the keypress listener for spacebar
                document.removeEventListener("keypress", onSpaceBar);
                //gameOver function here
                
                //post the scores of the user to server.js
                if(loggedIn) {
                    const platforms = height - 2;

                    //if the player received a higher score than the previous high score, post the new score
                    //and update placements
                    if(highLevel < level || (highLevel == level && extraPlatforms < platforms)) {
                    postScore()
                        .then((response) => {populateUserData(response)})
                        .then(() => {getTopScores()});
                    }
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

function updateScore() {
    extraPlatforms++;
    let levelDiv = document.getElementById('curr-level');
    levelDiv.textContent = level;
    let platformsDiv = document.getElementById('curr-platforms');
    if(extraPlatforms === 7) {
        extraPlatforms = 0;
    }

    platformsDiv.textContent = extraPlatforms;

    if(newHighScore) {
        let highLevelDiv = document.getElementById('high-level');
        highLevelDiv.textContent = levelDiv.textContent;
        let highPlatformsDiv = document.getElementById('high-platforms');
        highPlatformsDiv.textContent = platformsDiv.textContent;
        highLevel = level;
        highPlatforms = extraPlatforms;
    }
    else if((level === highLevel && extraPlatforms > highPlatforms) || level > highLevel) {
        //update the high score, set newHighScore to true, and display the new high score message
        highLevel = level;
        highPlatforms = extraPlatforms;
        newHighScore = true;

        let highLevelDiv = document.getElementById('high-level');
        let highPlatformsDiv = document.getElementById('high-platforms');
        highLevelDiv.textContent = level;
        highPlatformsDiv.textContent = extraPlatforms;

        highLevelDiv.style.fontWeight = "bold";
        highLevelDiv.style.color = "white";
        highPlatformsDiv.style.fontWeight = "bold";
        highPlatformsDiv.style.color = "white";

        let h1 = document.getElementById('new-high-score').getElementsByTagName('h1')[0];
        h1.style.opacity = "1";

        setTimeout(() => {
            highLevelDiv.style.color = "yellow";
            highLevelDiv.style.fontStyle = "normal";
            highPlatformsDiv.style.color = "yellow";
            highPlatformsDiv.style.fontStyle = "normal";
            h1.style.opacity = "0";
        }, 1000);
    } 
}

function levelUp() {
    level++;
    let currLevel = document.getElementById('curr-level');
    currLevel.style.fontWeight = "bold";
    currLevel.style.color = "white";
    let currPlatforms = document.getElementById('curr-platforms');
    currPlatforms.style.fontWeight = "bold";
    currPlatforms.style.color = "white";

    setTimeout(function() {
        currLevel.style.color = "yellow";
        currLevel.style.fontStyle = "normal";
        currPlatforms.style.color = "yellow";
        currPlatforms.style.fontStyle = "normal";
    }, 1010);
    pause();

    if(48 - 8*level < 16) gameSpeed -= 10;
    else gameSpeed -= (48 - 8*level);

    let counter = 0;
    let backgroundColor = document.getElementById('background');
    let interval = window.setInterval(() => {

        if(counter === 6) {
            clearInterval(interval);
        }

        for(let i = 0; i < platforms.length; i++) {
            platforms[i].style.top = (px2num(platforms[i].style.top) + blockWidth) + "px";
        }

        colorPercent += 2;
        backgroundColor.style.backgroundImage = "linear-gradient(rgb(41, 11, 39), rgb(212, 46, 201) " + colorPercent + "%)";

        platforms[0].remove();
        platforms.shift();
        counter++;
        height--;
    }, 400);

    if((level % 2) != 0 && blocksLeft < 3) {
        blocksLeft++;
        setTimeout(addBlock, 2800)
        setTimeout(() => {
            setPlatform(blockWidth, borderWidth);
            unpause(blockWidth, windowWidth, borderWidth); 
        }, 4200);
    }
    else {
        setTimeout(() => {
            setPlatform(blockWidth, borderWidth);
            unpause(blockWidth, windowWidth, borderWidth); 
        }, 2800);
    }
    
    
}

function addBlock() {
    let left = px2num(platforms[0].style.left) + (blockWidth * (blocksLeft - 1 ));

   /* if(left >= windowWidth / 2) {
        left -= (2 * blockWidth);
    } */

    let div = document.createElement('div');
    div.classList.add("child");
    div.style.position = "absolute";
    div.style.width = blockWidth + "px";
    div.style.height = blockWidth + "px";
    div.style.left = left + "px";
    div.style.top = platforms[0].style.top;
    div.style.transition = ".35s";
    floor.appendChild(div);

    let opaque = true;
    let count = 0;
    let interval = window.setInterval(() => {
        if(count == 4) {
            clearInterval(interval);
        }
        if(opaque) {
            div.style.opacity = "0";
            opaque = false;
        }
        else {
            div.style.opacity = "1";
            opaque = true;
        }

        count++;
    }, 350);

    setTimeout(() => {
        div.remove();
        platforms[0].style.width = (px2num(platforms[0].style.width) + blockWidth) + "px";
        let cell = document.createElement('div');
        cell.classList.add("child");
        platforms[0].appendChild(cell);
    }, 1400);
    
}

function startGame() {
    let scoreContainer = document.getElementById("score-container");
    let scores = scoreContainer.children;
    let iconContainer = document.getElementById("icon-container-game");
    let icons = iconContainer.children;
    
    playButton.style.transition = ".5s";
    playButton.style.opacity = "0";
    instructions.style.transition = ".5s";
    instructions.style.opacity = "0";
    leaderboard.style.transition = ".5s";
    leaderboard.style.opacity = "0";
    scoreContainer.style.transition = "1s ease-in-out";
    scoreContainer.style.left = "5%";
    iconContainer.style.transition = "1s ease-in-out";
    iconContainer.style.right = "7%";

    for(let i = 0; i < 2; i++) {
        scores[i].style.transition = "2s";
        scores[i].style.opacity = "1";
    }

    for(let i = 0; i < 3; i++) {
        icons[i].style.transition = "1s";
        icons[i].style.opacity = "1";
    }

    window.setTimeout(function() {
        playButton.remove();
        instructions.remove();
        leaderboard.remove();

        //set instructions to new instruction icon
        document.getElementById("instructions").style.top = "20vh";
        instructions = document.getElementById("instructions-game");
        instructions.addEventListener("click", openInstructions, false);
        leaderboard = document.getElementById("leaderboard-game");
        leaderboard.addEventListener("click", openLeaderboard, false);

        leaderboard = document.getElementById("leaderboard-game");
    }, 500);

    navBar.style.transition = ".7s ease-in-out"
    navBar.style.top = "0";
    titleText.style.transition = "1s ease-in-out";
    titleText.style.top = "3vh";
    
    setTimeout(function() {
        titleText.style.transition = "0s";
        navBar.style.transition = "0s";
        scoreContainer.style.transition = "0s";
        for(let i = 0; i < 2; i++) {
            scores[i].style.transition = "0s";
        }
    }, 1000);

    setTimeout(function() {
        for(let i = 0; i < 3; i++) {
            icons[i].style.transition = "0s";
        }

        for(let i = 0; i < 2; i++) {
            scores[i].style.transition = "0s";
        }

    }, 1000);

    resizePlatforms(blockWidth);
    loadScreen = false;

    //add the event listener for the space bar to drop platforms
    document.addEventListener("keypress", onSpaceBar);
    
}

function openInstructions() {
    pause();
    let background = document.getElementById("instructions");
    let textBox = document.getElementById("textBox");
    let X = document.getElementById("instructionX");

    background.style.height = "50vh";
    background.style.border = "yellow solid 5px";
    X.style.opacity = "100";
    X.style.cursor = "pointer";
    
    if(loadScreen) {
        titleText.style.opacity = "0";
        playButton.style.opacity = "0";
    }
    else {
        restartButton.style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "0";
    }
    
    leaderboard.style.opacity = "0";
    instructions.style.opacity = "0";

    setTimeout(function() {
        textBox.getElementsByTagName('h1')[0].style.opacity = "100";
        textBox.getElementsByTagName('p')[0].style.opacity = "100";
    }, 140);

    setTimeout(function() {
        textBox.getElementsByTagName('p')[1].style.opacity = "100";
    }, 220)

    setTimeout(function() {
        textBox.style.overflowY = "auto";
    }, 300);

    X.addEventListener("click", closeInstructions);
    restartButton.removeEventListener("click", restartGame, false);
    instructions.removeEventListener("click", openInstructions, false);
    leaderboard.removeEventListener("click", openLeaderboard, false);
    restartButton.style.cursor = "auto";
    instructions.style.cursor = "auto";
    leaderboard.style.cursor = "auto";

}

function closeInstructions() {
    unpause(blockWidth, windowWidth, borderWidth);
    if(loadScreen) paused = true;
    
    let background = document.getElementById("instructions");
    let textBox = document.getElementById("textBox");
    let X = document.getElementById("instructionX");

    background.style.height = "0";
    X.style.opacity = "0";
    X.style.cursor = "auto";
    textBox.style.overflowY = "hidden";

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
        restartButton.style.opacity = "100";
        
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "100";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "100";
        background.style.border = "none";
    }, 200);

    X.removeEventListener("click", closeInstructions);
    restartButton.addEventListener("click", restartGame, false);
    instructions.addEventListener("click", openInstructions, false);
    leaderboard.addEventListener("click", openLeaderboard, false);
    restartButton.style.cursor = "pointer";
    instructions.style.cursor = "pointer";
    leaderboard.style.cursor = "pointer";
}

function openLeaderboard() {
    pause();
    let background = document.getElementById("leaderboard");
    let topScores = document.getElementById("top-scores");
    let X = document.getElementById("leaderboardX");

    background.style.height = "50vh";
    background.style.border = "yellow solid 5px";
    topScores.style.border = "white solid 2px";
    X.style.opacity = "100";
    X.style.cursor = "pointer";
    
    if(loadScreen) {
        titleText.style.opacity = "0";
        playButton.style.opacity = "0";
    }
    else {
        restartButton.style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "0";
    }

    leaderboard.style.opacity = "0";
    instructions.style.opacity = "0";

    setTimeout(function() {
        background.getElementsByTagName('h1')[0].style.opacity = "1";
        
    }, 140);

    setTimeout(function() {
        textBox.getElementsByTagName('p')[1].style.opacity = "100";
    }, 220)

    X.addEventListener("click", closeLeaderboard);
    restartButton.removeEventListener("click", restartGame, false);
    instructions.removeEventListener("click", openInstructions, false);
    leaderboard.removeEventListener("click", openLeaderboard, false);
    restartButton.style.cursor = "auto";
    instructions.style.cursor = "auto";
    leaderboard.style.cursor = "auto";

    if(!loggedIn && !viewedPortal) {
        openLoginPortal();
    }

    //remove the event listener for key presses
    if(!loadScreen) {
        document.removeEventListener("keypress", onSpaceBar);
    }

}

function closeLeaderboard() {
    unpause(blockWidth, windowWidth, borderWidth);
    if(loadScreen) {
        paused = true;
        setTimeout(() => {
            titleText.style.opacity = "1";
            playButton.style.opacity = "1";
        }, 220);
    }
    else {
        setTimeout(() => {
            restartButton.style.opacity = "1";
            document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "1";
            document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "1";
            
        }, 220);
    }

    let background = document.getElementById("leaderboard");
    let topScores = document.getElementById("top-scores");
    let X = document.getElementById("leaderboardX");

    background.style.height = '0';

    setTimeout(function() {
        background.getElementsByTagName('h1')[0].style.opacity = "0";
    }, 140);

    setTimeout(function() {
        topScores.style.border = "none";
        X.style.opacity = "0";
        X.style.cursor = "auto";
        leaderboard.style.opacity = "1";
        instructions.style.opacity = "1";
        background.style.border = "none";
    }, 220);

    X.removeEventListener("click", closeLeaderboard);

    restartButton.addEventListener("click", restartGame, false);
    instructions.addEventListener("click", openInstructions, false);
    leaderboard.addEventListener("click", openLeaderboard, false);
    restartButton.style.cursor = "pointer";
    instructions.style.cursor = "pointer";
    leaderboard.style.cursor = "pointer";

    //re-add the event listener for key presses
    if(!loadScreen) {
        document.addEventListener("keypress", onSpaceBar);
    }
    
}

function setLeaderboardText() {
   
    if(loggedIn) {
        let container = document.getElementById("login-button-container").children[0];
        container.style.width = "100%";
        return;
    }

    if(getWindowWidth() < 600) {
        let loginBox = document.getElementById("login-button-container");
        loginBox.children[0].remove();
        let text = document.createElement('p');
        text.innerHTML = `<a id="login-button">Login</a> or <a id="sign-up-button">Sign Up</a> here!`
        loginBox.appendChild(text);
    }
    else {
        let loginBox = document.getElementById("login-button-container");
        loginBox.children[0].remove();
        let text = document.createElement('p');
        text.innerHTML = `Want to add your score to the leaderboards? <a id="login-button" href="#">Login</a> or <a id="sign-up-button" href="#">Sign Up</a> here!`
        loginBox.appendChild(text);
    }

    loginButton2 = document.getElementById("login-button");
    signUpButton2 = document.getElementById("sign-up-button");

    loginButton2.onclick = openLoginPortal;
    signUpButton2.onclick = openRegisterPortal;
}

function restartGame() {
    pause();
    level = 1;
    extraPlatforms = 0;
    gameSpeed = 150;
    height = 1;
    blocksLeft = 3;
    colorPercent = 20;
    firstBlock = true;
    newHighScore = false;

    let levelDiv = document.getElementById('curr-level');
    levelDiv.textContent = level;
    let platformsDiv = document.getElementById('curr-platforms');
    platformsDiv.textContent = extraPlatforms;
    

    let k = platforms.length;
    for(let i = 0; i < k; i++) {
        let div = platforms.shift();
        div.remove();
    }

    base = document.createElement('div');
    base.style.width = (4 * blockWidth) + "px";
    base.style.height = blockWidth + "px";
    base.style.position = "absolute";
    base.style.top = (-1 * blockWidth) + "px";
    base.style.left = (windowWidth / 2 - 2 * blockWidth) + "px";

    for(let i = 0; i < 4; i++) {
        let cell = document.createElement('div');
        cell.classList.add("child");
        base.appendChild(cell);
    }

    platforms.push(base);
    floor.appendChild(base);
    setPlatform(blockWidth, borderWidth);
    unpause(blockWidth, windowWidth, borderWidth);

    document.addEventListener("keypress", onSpaceBar);
    
}

function gameFinished() {
    //Create UI effects for gameover
    
}

function openLoginPortal() {
    let portal = document.getElementById("login-portal");
    const registerPortal = document.getElementById("register-portal");
    if(registerPortal.style.left === "50%") {
        closeRegisterPortal();
    }

        setTimeout(function() {
            portal.style.left = "40%";            
        }, 300);

        setTimeout(function() {
            portal.style.transition = ".3";
            portal.style.left = "50%";            
        }, 700)

        viewedPortal = true;
}

function closeLoginPortal() {
    const portal = document.getElementById("login-portal");
    portal.style.left = "40%";
    setTimeout(function() {
        portal.style.transition = ".4s";
        portal.style.left = "180%";
    }, 300);
    
}

function openRegisterPortal() {
    const portal = document.getElementById("register-portal");
    const loginPortal = document.getElementById("login-portal");
    if(loginPortal.style.left === "50%") {
        closeLoginPortal();
    }
    
    setTimeout(function() {
        portal.style.left = "60%";            
    }, 300);

    setTimeout(function() {
        portal.style.transition = ".3s";
        portal.style.left = "50%";            
    }, 700);
}

function closeRegisterPortal() {
    
    const portal = document.getElementById("register-portal");
    portal.style.left = "60%";
    setTimeout(function() {
        portal.style.transition = ".4s";
        portal.style.left = "-100%";
    }, 300);
}

function populateUserData(user) {
        let loginBox = document.getElementById("login-button-container");
        loginBox.children[0].remove();
        let wrapper = document.createElement('div');
        wrapper.classList.add("leaderboard-stats-container");
        const rankDiv = document.createElement('div');
        rankDiv.textContent = `${user.placement}`;
        const gamertagDiv = document.createElement('div');
        gamertagDiv.textContent = `${user.username}`;
        const levelDiv = document.createElement('div');
        levelDiv.textContent = `${user.level}`;
        const extraBlocksDiv = document.createElement('div');
        extraBlocksDiv.textContent = `${user.extraBlocks}`;

        wrapper.appendChild(rankDiv);
        wrapper.appendChild(gamertagDiv);
        wrapper.appendChild(levelDiv);
        wrapper.appendChild(extraBlocksDiv);

        loginBox.appendChild(wrapper);

        //update highscore
        highLevel = user.level;
        highPlatforms = user.extraBlocks;
        let highLevelDiv = document.getElementById("high-level");
        highLevelDiv.textContent = user.level;
        let highPlatformsDiv = document.getElementById("high-platforms");
        highPlatformsDiv.textContent = user.extraBlocks;

        //set leaderboard text so that it is properly formatted
        setLeaderboardText();

}

async function attemptLogin(e) {
    e.preventDefault();

    const user_name = document.getElementById("login-username").value;
    const user_pass = document.getElementById("login-pass").value;

    const data = await authenticateUser(user_name, user_pass);

    if(data.status === 200) {
        username = data.username;
        loggedIn = true;
        populateUserData(data);
        closeLoginPortal();
    }
    else if (data.status === 401) {
        //username/email not found, prompt user to try again
        document.getElementById("error-message-login").textContent = "Username/Email cannot be found";
        document.getElementById("error-message-login").style.color = 'red';
        document.getElementById("login-username").style.borderBottom = "2px solid red";

        document.getElementById("login-username").onclick = function() {
            document.getElementById("login-username").style.borderBottom = "1px solid #fff";
            document.getElementById("login-username").value = "";
            document.getElementById("error-message-login").textContent = "";
        }
    }
    else if (data.status === 403) {
        //password is incorrect, prompt user to try again
        document.getElementById("error-message-login").textContent = "Password is incorrect";
        document.getElementById("error-message-login").style.color = 'red';
        document.getElementById("login-pass").style.borderBottom = "2px solid red";

        document.getElementById("login-pass").onclick = function() {
            document.getElementById("login-pass").style.borderBottom = "1px solid #fff";
            document.getElementById("login-pass").value = "";
            document.getElementById("error-message-login").textContent = "";
        }
    }
}

async function attemptRegister(e) {
    e.preventDefault();

    const user_email = document.getElementById("register-email").value;
    const user_name = document.getElementById("register-username").value;
    const user_pass = document.getElementById("register-pass").value;
    const user_pass_confirm = document.getElementById("register-confirm-pass").value;

    //check if the passwords match one another
    //if they do not, clear the password fields and display an error message
    if(user_pass !== user_pass_confirm) {
        document.getElementById("register-pass").value = "";
        document.getElementById("register-confirm-pass").value = "";
        document.getElementById("error-message-register").textContent = "Passwords do not match";
        document.getElementById("error-message-register").style.color = 'red';
        document.getElementById("register-pass").style.borderBottom = "2px solid red";
        document.getElementById("register-confirm-pass").style.borderBottom = "2px solid red";

        document.getElementById("register-pass").onclick = function() {
            document.getElementById("register-pass").style.borderBottom = "1px solid #fff";
            document.getElementById("error-message-register").textContent = "";
        }
        document.getElementById("register-confirm-pass").onclick = function() {
            document.getElementById("register-confirm-pass").style.borderBottom = "1px solid #fff";
            document.getElementById("error-message-register").textContent = "";
        }
        return;
    }

    if(user_name.length > 25) {
        document.getElementById("error-message-register").textContent = "Username is too long";
        document.getElementById("error-message-register").style.color = 'red';
    }
    else if(user_pass.length > 25) {
        document.getElementById("error-message-register").textContent = "Password is too long";
        document.getElementById("error-message-register").style.color = 'red';
    }

    const data = await registerUser(user_email, user_name, user_pass);

    if(data.status === 409) {
        //if status of 409, then the username is already taken
        document.getElementById("error-message-register").textContent = "User already exists";
        document.getElementById("error-message-register").style.color = 'red';
        document.getElementById("register-username").style.borderBottom = "2px solid red";
        document.getElementById("register-username").value = "";
        
        document.getElementById("register-username").onclick = function() {
            document.getElementById("error-message-register").textContent = "";
            document.getElementById("register-username").style.borderBottom = "1px solid #fff";
        }
    } 
    else if (data.status === 408) {
        //is status of 408, then the email is already registered
        document.getElementById("error-message-register").textContent = "Email is already registered";
        document.getElementById("error-message-register").style.color = 'red';
        document.getElementById("register-email").style.borderBottom = "2px solid red";
        document.getElementById("register-email").value = "";

        document.getElementById("register-email").onclick = function() {
            document.getElementById("error-message-register").textContent = "";
            document.getElementById("register-email").style.borderBottom = "1px solid #fff";
        }
    } 
    else if(data.status === 201) {
    // add the user's information to the web browser and send a cookie so that their information may be stored
        username = user_name;
        loggedIn = true;
        closeRegisterPortal();
        populateUserData(data);
    } 
    else { // status == 500 (Internal Server Error)
        console.error("Internal Server Error");
    } 
}

//EFFECTS: Verifies the user's login credentials and logs them in if they are correct, returns the user's data if successful
//         as an object, otherwise returns an error message
async function authenticateUser(user_name, user_pass) {
    
    const user = {
        username: user_name, 
        password: user_pass
    };

    //JSON object to be passed into api
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    };

    const response = await fetch('/api/authenticate', options);
    const data = await response.json();

    return data;
}

//EFFECTS: Registers a new user to the database with a unique user_name
async function registerUser(user_email, user_name, user_pass) {
    
    const user = {
        email: user_email, 
        username: user_name, 
        password: user_pass
    };

    //JSON object to be passed into api
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    };

    const response = await fetch('/api/register', options);
    if(response.status === 409) {
        return response;
    }
    const data = await response.json();
    
    return data;
}

//REQUIRES: User is logged in to their account and has finished game with higher score than previous high score
//EFFECTS: Sends a POST request to the server with the user's final score data
async function postScore() {
    //If the user is logged in, take the user's final score and create a POST request to be evaluated 
    //in the server.js api
    const extraBlocks = height - 2;
    const user = {
        username: username,
        extraBlocks: extraBlocks,
        level: level
    }

    //JSON object to be passed into api
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }
    const response = await fetch('/api/updateScore', options)
    const data = await response.json();

    return data;
}

//EFFECTS: Retrieves the top 25 scores from the database and populates the leaderboard with the data
async function getTopScores() {
    
    //Retrieve the top 25 scores from the database and your own score
    const response = await fetch('/api/retrieveLeaderboards');
    const data = await response.json();
    
    if(data.status === 200) {
        //if the status is 200, then the request was successful
        //populate the leaderboard with the data
        let leaderboard = document.getElementById("top-scores");
        while(leaderboard.children.length > 1) {
            leaderboard.removeChild(leaderboard.lastChild);
        }
        const scores = data.topScores;
        for(let i = 0; i < scores.length; i++) {
            const container = document.createElement('div');
            container.classList.add("leaderboard-stats-container");
            const user = scores[i];
            const rankDiv = document.createElement('div');
            rankDiv.textContent = `${user.placement}`;
            const gamertagDiv = document.createElement('div');
            gamertagDiv.textContent = `${user.user_name}`;
            const levelDiv = document.createElement('div');
            levelDiv.textContent = `${user.high_level}`;
            const extraBlocksDiv = document.createElement('div');
            extraBlocksDiv.textContent = `${user.extra_platforms}`;

            container.appendChild(rankDiv);
            container.appendChild(gamertagDiv);
            container.appendChild(levelDiv);
            container.appendChild(extraBlocksDiv);
            document.getElementById("top-scores").appendChild(container);
        }
    }
    else if (data.status === 500) {
        //if the status is 500, then there was an internal server error
        console.error("Internal Server Error");

    }
}

//EFFECTS: Stops the moveInterval which pauses the game
function pause() {
    
    clearInterval(moveInterval); 
    paused = true;

}

//EFFECTS: Activates the moveInterval with gameSpeed frequency which unpauses the game
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