let osc = new Tone.Oscillator(440, "sine").toMaster()
let osc2 = new Tone.Oscillator(440, "sine").toMaster()
let osc3 = new Tone.Oscillator(440, "sine").toMaster()
let pressed = false;
let oscArray = [osc, osc2, osc3];
osc.volume.value = -100;
let b = 0;
let a = [{
    x: 0,
    y: 0
}, {
    x: 0,
    y: 0
}, {
    x: 0,
    y: 0
}];
var counter = 0;
var maxVal = 0;
var mute = false;



function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(0);
}

function draw() {
    background(b);
    if (pressed == true) {
        for (i = 0; i < maxVal; i++) {
            ellipse(a[i].x, a[i].y, 80, 80);
        }
    }
    ellipse(mouseX, mouseY, 80, 80);
}

function mouseReleased() {
    console.log('counter=' + counter);

    a[counter].x = mouseX;
    a[counter].y = mouseY;
    pressed = true;
    osc.start();
    ellipse(mouseX, mouseY, 80, 80);
    oscArray[counter].frequency.value = mouseX;
    oscArray[counter].volume.value = map(mouseY, 0, innerHeight, 10, -60);
    oscArray[counter].start();

    if (counter + 1 >= 3) {
        counter = 0;
    } else counter++;

    if (maxVal + 1 >= 3) {
        maxVal = 3;
    } else {
        maxVal++;
    }

    fill(255);
}

function keyPressed() {
    if (keyCode === 32) {
        if (mute == false) {
            b = 255;
            osc.mute = true;
            osc2.mute = true;
            osc3.mute = true;
            mute = true;
        } else {
            b = 0;
            osc.mute = false;
            osc2.mute = false;
            osc3.mute = false;
            mute = false;
        }


    } else if (keyCode === DOWN_ARROW) {
        b = 0;
    }
    return false; // prevent default
}
