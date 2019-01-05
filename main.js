
const player = document.querySelector('#player');
player.velocity = 0;  // > 0 down, < 0 UP
player.falling = false;
player.jumped = false;
const floors = document.querySelectorAll('.floor');
let buttonsState = {'right': false, 'left': false, 'space': false};
const speed = 5;
const jumpSpeed = 8;
const gravityFactor = 0.5;

function update() {
    if (buttonsState.right) {
        setX(player, getX(player) + speed);
    } else if (buttonsState.left) {
        setX(player, getX(player) - speed);
    }   

    if (isStoppedInTheAir(player)) {
        player.falling = true;
    }

    player.velocity += gravityFactor// gravity
    if (player.falling) {
        player.velocity += gravityFactor; // double it when falling
    }

    if (!isCollidingBottom(player) && player.velocity == 0) {
        player.velocity = 0.1;
    } 
    

    const bottom = isCollidingBottom(player);
    if (!player.jumped && bottom) {
        
        console.log(bottom);
        console.log(player.velocity);

        player.velocity = 0;
        setY(player, getY(player) - bottom);
    }

    player.jumped = false;

    setY(player, getY(player) + player.velocity);
}


function isStoppedInTheAir(player) {
    return !isCollidingBottom(player) && 
        player.velocity < 0 && 
        player.velocity + gravityFactor > 0;
}

function isCollidingBottom(obj) {
    const pX = getX(obj);
    const pW = getWidth(obj);
    const pY = getY(obj);
    const pH = getHeight(obj);

    for (floor of floors) {
        const d = dist(pY + pH, getY(floor));        
        if (pY + pH >= getY(floor) && 
            pY + pH <= getY(floor) + getHeight(floor) && 
            ((pX >= getX(floor) && 
            pX <= getX(floor) + getWidth(floor)) ||
            (pX + pW >= getX(floor) &&
            pX + pW <= getX(floor) + getWidth(floor)))
            ) {
            return d;
        }
    }

    return 0;
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
            jump(jumpSpeed);
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


function isEpsilon(number) {
    return Math.abs(number) < 1e-4;
}

function dist(a, b) {
    return a - b;
}

function jump(amount) {
    player.velocity = -jumpSpeed;
    player.falling = false;
    player.jumped = true;
}

function setX(obj, val) {
    obj.setAttribute("x", val);
}

function setY(obj, val) {
    obj.setAttribute("y", val);
}

function getX(obj) {
    return parseFloat(obj.getAttribute("x"));
}

function getY(obj) {
    return parseFloat(obj.getAttribute("y"));
}

function getWidth(obj) {
    return parseFloat(obj.getAttribute("width"));
}

function getHeight(obj) {
    return parseFloat(obj.getAttribute("height"));
}