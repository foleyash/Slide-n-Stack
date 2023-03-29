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

let base = document.getElementById('base');
let divWidth = getComputedStyle(base).width;

if(divWidth.length == 5) {
    divWidth = divWidth.substring(0, 3);
}
else {
    divWidth = divWidth.substring(0,2);
}

divWidth = Number(divWidth);

