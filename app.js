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