
const player = document.querySelector('#player');
let buttonsState = {'right': false, 'left': false, 'space': false};
const speed = 5;

let playerVelocity = 0; // > 0 down, < 0 UP
function update() {
    if (buttonsState.right) {
        setX(player, getX(player) + speed);
    } else if (buttonsState.left) {
        setX(player, getX(player) - speed);
    }   

    setY(player, getY(player) + playerVelocity);

    if (playerVelocity < 0) {
        playerVelocity += 0.1;
    }
}

function jump() {
    playerVelocity -= 10;
}

function mainLoop() {
    update();
    requestAnimationFrame(mainLoop);
}

function onKeyDown(e) {
    if (e.key == 'ArrowRight') {
        buttonsState.right = true;
    } else if (e.key == 'ArrowLeft') {
        buttonsState.left = true;
    } else if (e.key == ' ') {
        if (buttonsState.space == false) {
            jump();
        }
        buttonsState.space = true;
    }
}

function onKeyUp(e) {
    if (e.key == 'ArrowRight') {
        buttonsState.right = false;
    } else if (e.key == 'ArrowLeft') {
        buttonsState.left = false;
    } else if (e.key == ' ') {
        buttonsState.space = false;
    }
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp);
requestAnimationFrame(mainLoop);

function setX(obj, val) {
    obj.setAttribute("x", val);
}

function setY(obj, val) {
    obj.setAttribute("y", val);
}

function getX(obj) {
    return parseInt(obj.getAttribute("x"));
}

function getY(obj) {
    return parseInt(obj.getAttribute("y"));
}