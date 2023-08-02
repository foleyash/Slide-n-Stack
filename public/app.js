// **** GLOBAL VARIABLES BELOW ****

let floor = document.getElementById("game-floor");
let base = document.getElementById("base");
var playButton = document.getElementById("play-button-start");
var titleText = document.getElementById("slide-n-stack");
var navBar = document.getElementById("nav-bar");
var instructions = document.getElementById("instructions-start");
var leaderboard = document.getElementById("leaderboard-start");
var restartButton = document.getElementById("restart-button");
var muteButton = document.getElementById("mute-button");

//hide overflow in the window
document.body.style.overflow = "hidden";
document.body.style.borderTop = "3px solid white";

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
var colors = ['rgb(80, 14, 14)', 'rgb(230, 39, 39)', 'rgb(95, 185, 21)', 'rgb(11, 109, 238)', 'rgb(106, 31, 150)', 'rgb(42, 18, 65)', 'rgb(12, 11, 11)']

var moveRight = true;
var paused = false;
var firstBlock = true;
var gameOver = false;
var newHighScore = false;
var loadScreen = true;
var mute = false;

setLeaderboardText();

//user authentication local variables
var username = "";
var loggedIn = false;
var rememberMe = false;
var highLevel = 1;
var highPlatforms = 0;
var viewedPortal = false;

var loginForm = document.getElementById("login-form");
var registerForm = document.getElementById("sign-in-form");

var loginButton = document.getElementById("register-portal").getElementsByTagName("a")[1];
var loginButton2 = document.getElementById("login-button-container").getElementsByTagName("a")[0];

var closeLoginPortalButton = document.getElementById("login-portal").getElementsByTagName("a")[0];
var closeRegisterPortalButton = document.getElementById("register-portal").getElementsByTagName("a")[0];

var signUpButton = document.getElementById("login-portal").getElementsByTagName("a")[1];
var signUpButton2 = document.getElementById("login-button-container").getElementsByTagName("a")[1];

// **** EVENT LISTENERS BELOW ****

//icon features for leaderboard, instructions, and play game at start

playButton.addEventListener("click", startGame, false);

instructions.addEventListener("click", openInstructions, false);

restartButton.addEventListener('click', restartGame, false);

leaderboard.addEventListener("click", openLeaderboard, false);

// all event listeners for the login and register portals

closeLoginPortalButton.onclick = closeLoginPortal;

closeRegisterPortalButton.onclick = closeRegisterPortal;

signUpButton.onclick = openRegisterPortal;

signUpButton2.onclick = openRegisterPortal;

loginButton.onclick = openLoginPortal;

loginButton2.onclick = openLoginPortal;

loginForm.onsubmit = attemptLogin;

registerForm.onsubmit = attemptRegister;

// event listener for score info icon

document.getElementById("score-info").addEventListener("mouseenter", openScoreTemplate);

document.getElementById("score-info").addEventListener("mouseleave", closeScoreTemplate);

//begin the lava wave animation
let lavaInterval = window.setInterval(function() {
    if(wave_up) {
        wave_size++;
        let percent = 55 + wave_size;
        floor.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
        if(wave_size >= 20) {
            wave_up = false;
        }
    }
    else {
        wave_size--;
        let percent = 55 + wave_size;
        floor.style.backgroundImage = "linear-gradient(red, orange " + percent +  "%, yellow)";
        
        if(wave_size <= -20) {
            wave_up = true;
        }
    }
}, 50); 

//populate the leaderboard with the top 25 scores upon loading the page
getTopScores();

//retrieve the cookie data if it exists and populate the user data
getCookieData().then((cookieData) => {
    if(cookieData !== null) {
        loggedIn = true;
        rememberMe = true;
        populateUserData(cookieData);
        username = cookieData.username;
        highLevel = Number(cookieData.level);
        highPlatforms = Number(cookieData.extraBlocks);
    }
});


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


window.onresize = () => {
    if (gameOver) return;
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

    if(loadScreen) {
        leftBorder.style.borderTop = 'none';
        rightBorder.style.borderTop = 'none';
    }
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

    const baseLeft = px2num(platforms[0].style.left);
    const originalChildWidth = px2num(platforms[1].style.width) / platforms[1].children.length;

    for(let i = 0; i < platforms.length; i++) {
        if(i === 0) {
            platforms[i].style.left = (getWindowWidth() / 2 - 2 * childWidth) + "px";
            platforms[i].style.height = childWidth + "px";
            platforms[i].style.top = (-1 * (i + 1) * childWidth) + "px";
            platforms[i].style.width = (childWidth * platforms[i].children .length) + "px";
            continue;
        }
        else if (i === platforms.length - 1) {
            platforms[i].style.height = childWidth + "px";
            platforms[i].style.width = (childWidth*blocksLeft) + "px";
            platforms[i].style.top = (-1 * (i + 1) * childWidth) + "px";
            platforms[i].style.left = borderWidth + "px";
            continue;
        }

        platforms[i].style.height = childWidth + "px";
        platforms[i].style.width = (childWidth * platforms[i].childNodes.length) + "px";
        platforms[i].style.top = (childWidth * -1 * (i + 1)) + "px";
        let diff = px2num(platforms[i].style.left) - baseLeft;
        let blocksBetween = diff / originalChildWidth;
        platforms[i].style.left = (getWindowWidth() / 2 - 2 * childWidth) + (blocksBetween * childWidth) + "px";
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

    playSound('move');
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
            pos + (blocksLeft * blockWidth) <= topPos) { //blocks placed completely off of the top platform

        
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
                level === 1) {
                    let left = fallingBlocks[i].style.left;
                    let top = fallingBlocks[i].style.top;
                   fallingBlocks[i].remove();
                   fallingBlocks[i].style.visibility = 'hidden';
                   blockBreak(left, top, blockWidth);
                    continue;
            } 
            //check if falling block has landed on existing platform
            else if(currLeft >= nextLeft && currLeft <= nextLeft + nextWidth - blockWidth) {
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
                gameFinished();

                //post the scores of the user to server.js
                if(loggedIn) {
                    const platforms = height - 2;

                    //if the player received a higher score than the previous high score, post the new score
                    //and update placements
                    if(highLevel < level || (highLevel === level && highPlatforms <= platforms)) {
                        postScore()
                            .then((response) => {
                                populateUserData(response)
                                if(rememberMe) {
                                    storeUserData(response);
                                }
                            })
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

    //play the fireball splash sound effect
    playSound("splash");
}

function blockBreak(left, top, width) {

    //play the block break sound effect
    playSound("break");

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

    const firstColorTransition = 5;
    const secondColorTransition = 8;

    let firstPercent = 0;
    let secondPercent = 35;

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
    
    levelUpInterval = window.setInterval(() => {

        if(counter === 6) {
            clearInterval(levelUpInterval);
        }

        playSound("break");
        for(let i = 0; i < platforms.length; i++) {
            platforms[i].style.top = (px2num(platforms[i].style.top) + blockWidth) + "px";
        }

        //change the background color following the pattern (2nd upcoming, visible upcoming, current, previous)
        if(level === 6) {
            backgroundColor.style.backgroundImage = "linear-gradient(" + colors[level+1] + ", " + colors[level] +  
        " 0%, " + colors[level - 1] + " " + (firstPercent += firstColorTransition) + "%, " + colors[level - 2] + " " + 
        (secondPercent += secondColorTransition) + "%)";
        }
        backgroundColor.style.backgroundImage = "linear-gradient(" + colors[(level+1) % 7] + ", " + colors[(level % 7)] +  
        " 0%, " + colors[(level - 1) % 7] + " " + (firstPercent += firstColorTransition) + "%, " + colors[(level - 2) % 7] + " " + 
        (secondPercent += secondColorTransition) + "%)";


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
    playSound('addBlock');
    let left = px2num(platforms[0].style.left) + (blockWidth * (blocksLeft - 1 ));

    if(left >= (windowWidth / 2) + blockWidth) {
        left -= (blocksLeft * blockWidth);
    } 

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
        if(left < px2num(platforms[0].style.left)) {
            platforms[0].style.left = left + "px";
        }
        
        platforms[0].appendChild(cell);
        
    }, 1400);
    
}

function startGame() {
    playSound('gameMusic');
    document.body.style.borderTop = "none";
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
    iconContainer.style.right = "10%";

    for(let i = 0; i < scores.length; i++) {
        scores[i].style.transition = "2s";
        scores[i].style.opacity = "1";
    }

    for(let i = 0; i < icons.length; i++) {
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
        
        //set the mute button event to the mute button icon on click
        document.getElementById('mute-button').addEventListener('click', muteGame, false);

    }, 500);

    navBar.style.transition = ".7s ease-in-out"
    navBar.style.top = "0";
    titleText.style.transition = "1s ease-in-out";
    titleText.style.top = "3vh";
    
    setTimeout(function() {
        titleText.style.transition = "0s";
        navBar.style.transition = "0s";
        scoreContainer.style.transition = "0s";
        for(let i = 0; i < scores.length; i++) {
            scores[i].style.transition = "0s";
        }
    }, 1000);

    setTimeout(function() {
        for(let i = 0; i < icons.length; i++) {
            icons[i].style.transition = "0s";
        }

        iconContainer.style.transition = "0s";

        for(let i = 0; i < scores.length; i++) {
            scores[i].style.transition = "0s";
        }

    }, 1000);

    resizePlatforms(blockWidth, borderWidth);
    loadScreen = false;

    //add the event listener for the space bar to drop platforms
    document.addEventListener("keypress", onSpaceBar);
    
}

function openInstructions() {
    playSound('button');
    pause();
    let background = document.getElementById("instructions");
    let textBox = document.getElementById("textBox");
    let X = document.getElementById("instructionX");

    background.style.height = "50vh";
    background.style.border = "yellow solid 5px";
    X.style.opacity = "100";
    X.style.cursor = "pointer";

    let iconContainer;
    
    if(loadScreen) {
        iconContainer = document.getElementById("icon-container");
        titleText.style.opacity = "0";
    }
    else {
        iconContainer = document.getElementById("icon-container-game");
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "0";
    }

    for(let i = 0; i < iconContainer.children.length; i++) {
        iconContainer.children[i].style.opacity = "0";
    }
    

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
    playSound('exitButton');
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
        let iconContainer;

        if(loadScreen) {
            iconContainer = document.getElementById("icon-container");
            titleText.style.opacity = "1";
        }
        else {
            iconContainer = document.getElementById("icon-container-game");
            document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "100";
            document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "100";
        }

        for(let i = 0; i < iconContainer.children.length; i++) {
            iconContainer.children[i].style.opacity = "100";
        }
        
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
    playSound('button');
    pause();
    let background = document.getElementById("leaderboard");
    let topScores = document.getElementById("top-scores");
    let X = document.getElementById("leaderboardX");

    background.style.height = "50vh";
    background.style.border = "yellow solid 5px";
    topScores.style.border = "white solid 2px";
    X.style.opacity = "1";
    X.style.cursor = "pointer";

    let iconContainer;
    
    if(loadScreen) {
        iconContainer = document.getElementById("icon-container");
        titleText.style.opacity = "0";
    }
    else {
        iconContainer = document.getElementById("icon-container-game");
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "0";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "0";
    }

    for(let i = 0; i < iconContainer.children.length; i++) {
        iconContainer.children[i].style.opacity = "0";
    }

    setTimeout(function() {
        background.getElementsByTagName('h1')[0].style.opacity = "1";
        
    }, 140);

    setTimeout(function() {
        textBox.getElementsByTagName('p')[1].style.opacity = "1";
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
    playSound('exitButton');
    
    if (!gameOver) {unpause(blockWidth, windowWidth, borderWidth);}

    if(loadScreen) {
        paused = true;
        iconContainer = document.getElementById("icon-container");
        setTimeout(function() {
            titleText.style.opacity = "1";
        }, 220)
        
    }
    else {
        iconContainer = document.getElementById("icon-container-game");
        setTimeout(function() {
         document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "1";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "1";
        }, 220)
    }

    setTimeout(function() {
        for(let i = 0; i < iconContainer.children.length; i++) {
            iconContainer.children[i].style.opacity = "1";
        }
    }, 220)

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

function muteGame() {
    for(var key in sfx) {
        sfx[key].pause();
    }
    mute = true;

    document.getElementById('icon-container-game').children[3].style.display = "none";
    document.getElementById('icon-container-game').children[4].style.display = "inline";
    document.getElementById('icon-container-game').children[3].removeEventListener("click", muteGame, false);
    document.getElementById('icon-container-game').children[4].addEventListener("click", unMuteGame, false);
}

function unMuteGame() {
    sfx['gameMusic'].play();
    mute = false;

    document.getElementById('icon-container-game').children[4].style.display = "none";
    document.getElementById('icon-container-game').children[3].style.display = "inline";
    document.getElementById('icon-container-game').children[3].addEventListener("click", muteGame, false);
    document.getElementById('icon-container-game').children[4].removeEventListener("click", unMuteGame, false);
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
    loginButton2.style.cursor = "pointer";
    signUpButton2.style.cursor = "pointer";

    loginButton2.onclick = openLoginPortal;
    signUpButton2.onclick = openRegisterPortal;
}

function restartGame() {
    sfx['gameMusic'].stop();
    if(!mute) {
        playSound('gameMusic');
    }
    pause();
    level = 1;
    extraPlatforms = 0;
    gameSpeed = 150;
    height = 1;
    blocksLeft = 3;
    colorPercent = 20;
    firstBlock = true;
    newHighScore = false;
    gameOver = false;

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

    //reset the background to the starting colors
    let background = document.getElementById("background");
    background.style.backgroundImage = "linear-gradient(rgb(95, 185, 21), rgb(230, 39, 39) 0%, rgb(80, 14, 14) 30%)"
    unpause(blockWidth, windowWidth, borderWidth);

    document.addEventListener("keypress", onSpaceBar);
    
}

function openScoreTemplate() {
    document.getElementById("score-info").removeEventListener("mouseenter", openScoreTemplate);
    let div = document.createElement('div');
    div.id = "score-template";
    div.style.fontFamily = "Bruno Ace SC, cursive";
    let windowWidth = getWindowWidth();

    if(windowWidth < 800) {
        div.style.width = "0%";
        div.style.backgroundColor = "red";
        div.style.transition = ".4s";
        div.style.overflow = "hidden";
        div.style.textAlign = "center";
        div.style.height = "18px";
        
        if(windowWidth < 400) {
            div.style.fontSize = "8px";
        }
        else if(windowWidth < 600) {
            div.style.fontSize = "10px";
        }
        else {
            div.style.fontSize = "12px";
        }
        
        div.style.color = "yellow";
        div.textContent = "Score = (Level | Platforms)";
        div.style.border = "1px solid yellow";
        div.style.padding = "3px";

        document.getElementById("score-container").insertBefore(div, document.getElementById("score-container").children[1]);

        setTimeout(() => {
            div.style.width = "70%";
        }, 50);

    }
    else {
    let scoreIcon = document.getElementById("score-info");

    let rect = scoreIcon.getBoundingClientRect();
    div.style.position = "absolute";
    div.style.top = rect.top + "px";
    div.style.left = rect.right + "px";
    div.style.marginLeft = "10px";
    div.style.width = "0px";
    div.style.backgroundColor = "red";
    div.style.transition = ".4s";
    div.style.overflow = "hidden";
    div.style.textAlign = "center";
    div.style.height = "19px";
    div.style.fontSize = "13px";
    div.style.color = "yellow";
    div.textContent = "Score = (Level | Platforms)";
    div.style.border = "1px solid yellow";
    div.style.padding = "3px";

    //append the div to the background
    document.getElementById("background").appendChild(div);

    setTimeout(function() {
        div.style.width = "300px";

    }, 50);

    }
    
}

function closeScoreTemplate() {
    let div = document.getElementById("score-template");

    div.style.width = "0px";
    div.style.padding = "0px";

    setTimeout(function() {
        div.remove();
    }, 400); 

    setTimeout(function() {
        document.getElementById("score-info").addEventListener("mouseenter", openScoreTemplate);
    }, 850); 
    
}

//REQURIES: The game is over
//MODIFIES: platforms, backgroundColor
//EFFECTS: The UI of the game turns into a gameover screen prompting the user to play again with information about their score
function gameFinished() {
    gameOver = true;
    //Grab the counter variables for the platform submerging interval
    let numPlatforms = platforms.length;
    let counter = 0;

    //clear the lava movement interval
    clearInterval(lavaInterval);

    //create a background div to display the game over screen
    let gameOverBackground;
    gameOverBackground = document.createElement('div');
    gameOverBackground.id = "game-over-background";
    gameOverBackground.style.width = "100%";
    gameOverBackground.style.height = "85vh";
    gameOverBackground.style.position = "absolute";
    gameOverBackground.style.top = "85vh";
    gameOverBackground.style.zIndex = "9";
    gameOverBackground.style.backgroundImage = floor.style.backgroundImage;
    background.appendChild(gameOverBackground);

    //show the stack of platforms becoming covered by lava one by one
    gameOverInterval = window.setInterval(() => {

        if(counter === numPlatforms) {
            clearInterval(gameOverInterval);
            return;
        }

        for(let i = 0; i < platforms.length; i++) {
            platforms[i].style.top = (px2num(platforms[i].style.top) + blockWidth) + "px";
        }

        platforms[0].remove();
        platforms.shift();
        counter++;
        height--;
    }, 300); 

    //after the platforms have been covered by lava, show the game over screen
    setTimeout(() => {

        //remove the event listeners for each icon
        restartButton.removeEventListener('click', restartGame);
        instructions.removeEventListener('click', openInstructions);
        leaderboard.removeEventListener('click', openLeaderboard);
        muteButton.removeEventListener('click', muteGame);
        if(loggedIn) {
            document.getElementById("sign-out-button").removeEventListener('click', openSignOutPortal);
        }

        document.getElementById("score-info").removeEventListener("mouseenter", openScoreTemplate);

        document.getElementById("score-info").removeEventListener("mouseleave", closeScoreTemplate);

        let iconContainer = document.getElementById("icon-container-game");
        let scoreContainer = document.getElementById("score-container");
        for(let i = 0; i < iconContainer.children.length; i++) {
            iconContainer.children[i].style.opacity = "0";
            iconContainer.children[i].style.cursor = "normal";
        }

        for(let i = 0; i < scoreContainer.children.length; i++) {
            scoreContainer.children[i].style.opacity = "0";
        }

            gameOverBackground.style.transition = "2.5s ease-out";
            gameOverBackground.style.backgroundImage = "linear-gradient(to bottom, red, black 99%)";
            gameOverBackground.style.top = "15vh";

            let gameOverTextDiv = document.createElement('div');
            gameOverTextDiv.style.position = "absolute";
            gameOverTextDiv.style.top = "15%";
            gameOverTextDiv.style.left = "50%";
            gameOverTextDiv.style.width = "80%";
            gameOverTextDiv.style.height = "fit-content";
            gameOverTextDiv.style.transform = "translate(-50%, 0%)";

            let gameOverText = document.createElement('h1');
            gameOverText.textContent = "Game Over";
            gameOverText.classList.add("game-over-text");

            let scoreText = document.createElement('h1');
            scoreText.textContent = "Score: " + level + " | " + extraPlatforms;
            scoreText.classList.add("game-over-sub-text");

            let leaderboardText = document.createElement('h1');
            leaderboardText.textContent = "Leaderboard";
            leaderboardText.classList.add("game-over-sub-text");
            leaderboardText.id = "leaderboard-text-game-over";
            leaderboardText.style.width = "fit-content";
            leaderboardText.style.marginLeft = "50%";
            leaderboardText.style.transform = "translate(-50%, 0%)";

            let playAgainText = document.createElement('h1');
            playAgainText.innerHTML = `Play Again?`;
            playAgainText.style.backgroundColor = "black";
            playAgainText.style.padding = "20px";
            playAgainText.style.marginTop = "10px";
            playAgainText.style.borderRadius = "10px";
            playAgainText.style.border = "1px solid yellow";
            playAgainText.classList.add("game-over-sub-text");
            playAgainText.style.width = "fit-content";
            playAgainText.style.position = "absolute";
            playAgainText.style.left = "50%";
            playAgainText.style.transform = "translate(-50%, 0%)";
            playAgainText.id = "play-again-text";

            let playAgainDiv = document.createElement('div');
            playAgainDiv.style.width = "100%";
            playAgainDiv.style.height = "fit-content";
            //playAgainDiv.style.position = "absolute";
            playAgainDiv.appendChild(playAgainText);

            gameOverTextDiv.appendChild(gameOverText);
            gameOverTextDiv.appendChild(scoreText);
            gameOverTextDiv.appendChild(leaderboardText);
            gameOverTextDiv.appendChild(playAgainDiv);

            gameOverBackground.appendChild(gameOverTextDiv);

            setTimeout(() => {
                
                scoreText.style.opacity = "1";
                setTimeout(() => {
                    leaderboardText.style.opacity = "1";
                    leaderboardText.style.cursor = "pointer";
                    leaderboardText.onclick = openLeaderboard;

                    setTimeout(() => {
                        leaderboardText.style.transition = ".5s";
                    }, 10);
                }, 350);
                
                setTimeout(() => {
                    playAgainText.style.opacity = "1";
                    playAgainText.style.cursor = "pointer";
                    playAgainText.addEventListener("click", () => {
                        gameOverBackground.remove();
                        restartGame();

                        for(let i = 0; i < iconContainer.children.length; i++) {
                            iconContainer.children[i].style.opacity = "1";
                            iconContainer.children[i].style.cursor = "pointer";
                        }
                        restartButton = document.getElementById("restart-button");
                        restartButton.addEventListener('click', restartGame);
                        leaderboard = document.getElementById("leaderboard-game");
                        leaderboard.addEventListener('click', openLeaderboard);
                        instructions = document.getElementById("instructions-game");
                        instructions.addEventListener('click', openInstructions);
                        muteButton = document.getElementById("mute-button");
                        muteButton.addEventListener('click', muteGame);
                        if(loggedIn) {
                            let signOutButton = document.getElementById("sign-out-button");
                            signOutButton.addEventListener('click', openSignOutPortal);
                        }
                        
                        for(let i = 0; i < scoreContainer.children.length; i++) {
                            scoreContainer.children[i].style.opacity = "1";
                        }

                        document.getElementById("score-info").addEventListener("mouseenter", openScoreTemplate);

                        document.getElementById("score-info").addEventListener("mouseleave", closeScoreTemplate);

                    });

                    setTimeout(() => {
                        playAgainText.style.transition = ".5s";
                    }, 10);
                }, 700);
                
                
            }, 1000);

            setTimeout(() => {
                gameOverBackground.style.transition = "0s";
            }, 2500);
    }, (numPlatforms * 300) - 300);
}

function openLoginPortal() {
    if(viewedPortal) {
        playSound("button");
    }
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
    playSound("exitButton");
    const portal = document.getElementById("login-portal");
    portal.style.left = "40%";
    setTimeout(function() {
        portal.style.transition = ".4s";
        portal.style.left = "180%";
    }, 300);
    
}

function openRegisterPortal() {
    playSound("button");
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
    playSound("exitButton");
    const portal = document.getElementById("register-portal");
    portal.style.left = "60%";
    setTimeout(function() {
        portal.style.transition = ".4s";
        portal.style.left = "-100%";
    }, 300);
}

function openSignOutPortal() {

    playSound('button');
    pause();
    const portal = document.getElementById("sign-out-portal");
    let X = document.getElementById("sign-out-x");

    portal.style.height = "50vh";
    portal.style.border = "yellow solid 5px";
    X.style.display = "block";
    X.style.cursor = "pointer";

    let iconContainer = document.getElementById("icon-container-game");
    document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "0";
    document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "0";

    for(let i = 0; i < iconContainer.children.length; i++) {
        iconContainer.children[i].style.opacity = "0";
    }

    setTimeout(function() {
        portal.getElementsByTagName('h1')[0].style.display = "block";
    }, 140);

    setTimeout(function() {
        portal.getElementsByTagName('div')[0].children[0].style.opacity = "1";
        portal.getElementsByTagName('div')[0].children[1].style.opacity = "1";
    }, 220);

    const yesButton = document.getElementById("sign-out-portal").getElementsByTagName('button')[0];
    const noButton = document.getElementById("sign-out-portal").getElementsByTagName('button')[1];

    yesButton.addEventListener("click", signOut);
    yesButton.addEventListener("click", closeSignOutPortal);
    noButton.addEventListener("click", closeSignOutPortal);

    X.addEventListener("click", closeSignOutPortal);
    restartButton.removeEventListener("click", restartGame, false);
    instructions.removeEventListener("click", openInstructions, false);
    leaderboard.removeEventListener("click", openLeaderboard, false);
    muteButton.removeEventListener("click", muteGame);
    restartButton.style.cursor = "auto";
    instructions.style.cursor = "auto";
    leaderboard.style.cursor = "auto";
    muteButton.style.cursor = 'auto';

    //remove the event listener for key presses
    document.removeEventListener("keypress", onSpaceBar);

}

function closeSignOutPortal() {
    playSound('exitButton');
    unpause(blockWidth, windowWidth, borderWidth);
    const portal = document.getElementById("sign-out-portal");
    let X = document.getElementById("sign-out-x");

    portal.style.height = "0vh";
    portal.style.border = "none";

    setTimeout(() => {
        
        const iconContainer = document.getElementById("icon-container-game");
        document.getElementById("score-container").getElementsByTagName('h1')[0].style.opacity = "1";
        document.getElementById("score-container").getElementsByTagName('h1')[1].style.opacity = "1";
        
        for(let i = 0; i < iconContainer.children.length; i++) {
            iconContainer.children[i].style.opacity = "1";
        }
    }, 220);
    
    
    setTimeout(function() {
        portal.getElementsByTagName('h1')[0].style.display = "none";
        X.style.display = "none";
        X.style.cursor = "auto";
    }, 220);

    setTimeout(function() {
        portal.getElementsByTagName('div')[0].children[0].style.opacity = "0";
        portal.getElementsByTagName('div')[0].children[1].style.opacity = "0";
    }, 50);

    const yesButton = document.getElementById("sign-out-portal").getElementsByTagName('button')[0];
    const noButton = document.getElementById("sign-out-portal").getElementsByTagName('button')[1];

    yesButton.removeEventListener("click", signOut);
    yesButton.removeEventListener("click", closeSignOutPortal);
    noButton.removeEventListener("click", closeSignOutPortal);

    X.removeEventListener("click", closeSignOutPortal);
    restartButton.addEventListener("click", restartGame, false);
    instructions.addEventListener("click", openInstructions, false);
    leaderboard.addEventListener("click", openLeaderboard, false);
    muteButton.addEventListener("click", muteGame);
    restartButton.style.cursor = "pointer";
    instructions.style.cursor = "pointer";
    leaderboard.style.cursor = "pointer";
    muteButton.style.cursor = 'pointer';


    //re-add the event listener for key presses if not on the load screen still
    document.addEventListener("keypress", onSpaceBar);
}

function populateUserData(user) {

    //update leaderboard with the user's data
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

    //create hello user message and sign out button if the user hasn't already logged in before
    if(document.getElementById("sign-out-button") === null) {
    let iconContainer = document.getElementById("icon-container-game");
    let currHTML = iconContainer.innerHTML;
    let newHTML = currHTML + `<i id="sign-out-button" class="fa-solid fa-right-from-bracket" style="color: #ffff00;"></i>`;
    iconContainer.innerHTML = newHTML;
    iconContainer.appendChild(document.createElement('br'));
    let helloUser = document.createElement('h1');
    helloUser.innerHTML = `Hello, ${user.username}`;
    helloUser.style.textAlign = "right";
    helloUser.style.width = "fit-content";
    iconContainer.appendChild(helloUser);

    //change the grid template columns to accomodate the new icon
    iconContainer.style.gridTemplateColumns = "repeat(3, 33%)";
    let muteButton = document.getElementById("mute-button");
    let unmuteButton = document.getElementById("unmute-button");
    muteButton.style.gridColumnStart = "2";
    unmuteButton.style.gridColumnStart = "2";

    //add sign out button functionality
    let signOutButton = document.getElementById("sign-out-button");
    signOutButton.addEventListener("click", openSignOutPortal);

    if(!loadScreen) {
        leaderboard = document.getElementById("leaderboard-game");     
        instructions = document.getElementById('instructions-game');
    }

    leaderboard.addEventListener("click", openLeaderboard);
    instructions.addEventListener("click", openInstructions);
    restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", restartGame);
    muteButton.addEventListener("click", muteGame);
    }
    //set leaderboard text so that it is properly formatted
    setLeaderboardText();

}

function setIcons() {

}

async function attemptLogin(e) {
    e.preventDefault();

    const user_name = document.getElementById("login-username").value;
    const user_pass = document.getElementById("login-pass").value;
    rememberMe = document.getElementById("remember-me-login").checked;

    const data = await authenticateUser(user_name, user_pass);

    if(data.status === 200) {
        username = data.username;
        loggedIn = true;
        populateUserData(data);
        closeLoginPortal();

        if(rememberMe) {
            storeUserData(data);
        }

        document.getElementById("login-username").value = "";
        document.getElementById("login-pass").value = "";
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
    rememberMe = document.getElementById("remember-me-register").checked;

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
        getTopScores();
        populateUserData(data);
        closeRegisterPortal();
        
        if(rememberMe) {
            storeUserData(data);
        }

        //clear the register form
        document.getElementById("register-email").value = "";
        document.getElementById("register-username").value = "";
        document.getElementById("register-pass").value = "";
        document.getElementById("register-confirm-pass").value = "";

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

        if(scores.length < 25) {
            for(let i = scores.length; i < 25; i++) {
                const container = document.createElement('div');
                container.classList.add("leaderboard-stats-container");
                const rankDiv = document.createElement('div');
                rankDiv.textContent = `${i + 1}`;
                const gamertagDiv = document.createElement('div');
                gamertagDiv.textContent = `???`;
                const levelDiv = document.createElement('div');
                levelDiv.textContent = `???`;
                const extraBlocksDiv = document.createElement('div');
                extraBlocksDiv.textContent = `???`;

                container.appendChild(rankDiv);
                container.appendChild(gamertagDiv);
                container.appendChild(levelDiv);
                container.appendChild(extraBlocksDiv);
                document.getElementById("top-scores").appendChild(container);
            }
        }
    }
    else if (data.status === 500) {
        //if the status is 500, then there was an internal server error
        console.error("Internal Server Error");

    }
}

//EFFECTS: Creates a cookie that stores the user's stats and username for future use
function storeUserData(data) {
    //set the expiration date of the cookie to 30 days from now
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    //Store the user's gamertag in a cookie
    document.cookie = `user_name=${data.username}; ${expires}`;
}

//EFFECTS: Retrieves the user's data from the cookie and returns the data as an object
async function getCookieData() {
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split('; ');

    let cookieUserName = null;
    let userData = null;


    if(cArr[0].indexOf("user_name") === 0) {
        cookieUserName = cDecoded.substring("user_name=".length, cDecoded.length);
    }

    if(cookieUserName !== null) {
        const data = {
            username: cookieUserName
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        const response = await fetch('/api/userData', options);

        if(response.status === 401) {
            //if the status is 401, then the user is not logged in
            //remove the cookie and return null
            forgetUserData();
        }
        else if (response.status === 500) {
            //if the status is 500, then there was an internal server error
            console.error("Internal Server Error");
        }
        else if(response.status === 200) {
            //if the status is 200, then the request was successful
            //return the user's data
            userData = await response.json();
            return userData;
        }
    }

    return null;
}

//EFFECTS: Deletes the user's cookie data in the web browser
function forgetUserData() {
    //set the expiration date of the cookie to 30 days ago
    const date = new Date();
    date.setTime(date.getTime() - (30 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    //Remove the cookie by setting the expiration date to 30 days ago
    document.cookie = `user_name=; ${expires}`;

}


//REQUIRES: User is logged in to their account
//MODIFIES: UI of high score, login box, and removes the sign out button
//EFFECTS: Signs the user out of their account and removes their data from the application as well as from any cookies
//         that may be stored in the web browser
function signOut() {
    //remove the user's data from the application and return them to the default (non-signed-in) state
    username = "";
    loggedIn = false;
    highLevel = level;
    highPlatforms = extraPlatforms;

    //alter the format of the icons to a 4x1
    let iconContainer = document.getElementById("icon-container-game");
    iconContainer.style.gridTemplateColumns = "repeat(4, 25%)";
    let muteButton = document.getElementById("mute-button");
    let unmuteButton = document.getElementById("unmute-button");
    muteButton.style.gridColumnStart = "4";
    unmuteButton.style.gridColumnStart = "4";

    let loginBox = document.getElementById("login-button-container");
    loginBox.children[0].remove();
    loginBox.innerHTML = `<p>Want to add your score to the leaderboards? <a href="#">Login</a> or <a href="#">sign up</a> today!</p>`;

    const highLevelDiv = document.getElementById("high-level");
    highLevelDiv.textContent = `${highLevel}`;
    const extraPlatformsDiv = document.getElementById("high-platforms");
    extraPlatformsDiv.textContent = `${extraPlatforms}`;

    //remove the sign out button and the user's gamertag from the UI
    document.getElementById("sign-out-button").remove();
    document.getElementById("icon-container-game").getElementsByTagName('br')[0].remove();
    document.getElementById("icon-container-game").getElementsByTagName('h1')[0].remove();

    //set the new login and sign up buttons
    signUpButton2 = loginBox.getElementsByTagName('a')[1];
    loginButton2 = loginBox.getElementsByTagName('a')[0];

    signUpButton2.addEventListener('click', openRegisterPortal);
    loginButton2.addEventListener('click', openLoginPortal);

    //remove the user's data from the cookie by calling forgetUserData()
    forgetUserData();
}

function playSound(soundName) {
    //Plays the audio file of the src that is passed in
    if(!mute) sfx[soundName].play();
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