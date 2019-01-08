let buttonsState = {'right': false, 'left': false, 'space': false};
const GravityFactor = 0.5;
const Width = 800;
const Height = 600;
const State = {'Running': 1, 'Died': 2, 'Win': 3}
let GameState = State.Running;

const timer = document.querySelector('.stopwatchText');
const stopwatch = new Stopwatch(timer, null);
stopwatch.start();

class Entity {
    constructor(svg) {
        this.svg = svg;
    }

    setX(val) {
        this.svg.setAttribute("x", val);
    }

    setY(val) {
        this.svg.setAttribute("y", val);
    }

    getX() {
        return parseFloat(this.svg.getAttribute("x"));
    }

    getY() {
        return parseFloat(this.svg.getAttribute("y"));
    }

    getWidth() {
        return parseFloat(this.svg.getAttribute("width"));
    }

    getHeight() {
        return parseFloat(this.svg.getAttribute("height"));
    }

    onPlayerTouch() {

    }

    shouldStopHorizontally() {
        return true;
    }

    shouldStopVertically() {
        return true;
    }
}

class Flag extends Entity {
    constructor(svg) {
        super(svg);
        this.wasTouched = false;
    }

    onPlayerTouch() {
        if (!this.wasTouched) {
            this.wasTouched = true;
            stopwatch.stop();
            gameWin();
        }
        
    }

    shouldStopHorizontally() {
        return false;
    }

    shouldStopVertically() {
        return false;
    }
}



const base = [...document.querySelectorAll('.floor')].map((f) => new Entity(f));
const flags = [...document.querySelectorAll('.flag')].map((f) => new Flag(f));
const floors = [...base, ...flags];
class Player extends Entity {
    constructor(svg) {
        super(svg);
        this.baseX  = this.getX();
        this.baseY = this.getY();
        this.sideSpeed = 4.0;
        this.jumpSpeed = 11;
        
        this.rightMovement = false;
        this.leftMovement = false;

        this.jump = false;
        this.currentVelocity = 0;
    }

    onButtonsStateChanged(prev, next) {
        this.rightMovement = next.right;
        this.leftMovement = next.left;


        if (next.space) {
            this.jump = true;
        }

        if (!next.space) {
            this.jump = false;
        }
    }

    isTouchingFloorLeft(x, y, floor) {
        if (y + this.getHeight() <= floor.getY()) return false;
        if (y >= floor.getY() + floor.getHeight()) return false;
        
        const pX = x + this.getWidth();
        return (pX - floor.getX() > -0.5);
    }

    isTouchingFloorRight(x, y, floor) {
        if (y + this.getHeight() <= floor.getY()) return false;
        if (y >= floor.getY() + floor.getHeight()) return false;
    
        return (x - (floor.getX() + floor.getWidth()) < -0.5); 
    }

    willTouchFloor(delta) {
        for (let floor of floors) {
            if (!this.isTouchingFloorLeft(this.getX(), this.getY(), floor)
                && this.isTouchingFloorLeft(this.getX() + delta, this.getY(), floor)) {
                return floor;
            }

            if (!this.isTouchingFloorRight(this.getX(), this.getY(), floor)
                && this.isTouchingFloorRight(this.getX() + delta, this.getY(), floor)) {
                return floor;
            }
        }

        return null;
    }

    moveSides() {
        let delta = 0;
        if (this.rightMovement) {
            delta += this.sideSpeed;
        }
        if (this.leftMovement) {
            delta -= this.sideSpeed;
        }

        const d = this.willTouchFloor(delta);
        if(d) {
            d.onPlayerTouch();
            delta = d.shouldStopHorizontally() ? 0 : delta;
        }

        this.setX(this.getX() + delta);
    }

    isAfterFloor(x, y, floor) {
        const pY = y + this.getHeight();
        const pX = x + this.getWidth();

        if (pX < floor.getX()) return false;
        if (x > floor.getX() + floor.getWidth()) return false;

        return pY - floor.getY() > -0.5;
    }

    willBeOnFloor(delta) {
        for (let floor of floors) {
            if (!this.isAfterFloor(this.getX(), this.getY(), floor)
                && this.isAfterFloor(this.getX(), this.getY() + delta, floor)) {
                return floor;
            }
        }

        return null;
    }

    isUnderCeil(x, y,  floor) {
        const pX = x + this.getWidth();

        if (pX < floor.getX()) return false;
        if (x > floor.getX() + floor.getWidth()) return false;

        return y - (floor.getY() + floor.getHeight()) < -0.5;
    }

    willTouchCeil(delta) {
        for (let floor of floors) {
            if (!this.isUnderCeil(this.getX(), this.getY(), floor)
                && this.isUnderCeil(this.getX(), this.getY() + delta, floor)) {
                return floor;
            }
        }

        return null;
    }


    moveVertical() {
        this.currentVelocity += GravityFactor;
        if (this.jump && this.willBeOnFloor(GravityFactor)) {
            this.currentVelocity = -this.jumpSpeed;
            this.jump = false;
        }

        const stop = this.willBeOnFloor(this.currentVelocity) || this.willTouchCeil(this.currentVelocity);
        if (stop) {
            this.currentVelocity = stop.shouldStopVertically() ? 0 : this.currentVelocity; // floor and ceiling collision
            stop.onPlayerTouch();
        }
        
        this.setY(this.getY() + this.currentVelocity);
    }

    update() {
        if (this.getY() > Height) {
            gameOver();
        }
        this.moveSides();
        this.moveVertical();
    }
}



const player = new Player(document.querySelector('#player'));

function update() {
    player.update();
}

function buttonsStateChanged(prev, next)  {
    player.onButtonsStateChanged(prev, next);
}

function gameOver() {
    GameState = State.Died;
    document.querySelector('#gameOverBox').style.display = 'block';
    document.querySelector('#restartGame').style.display = 'block';
    document.querySelector('#restart').style.display = 'block';
    document.querySelector('.overlayBox').style.display = 'block';
    stopwatch.stop();
}

function gameWin() {
    GameState = State.Win;
    document.querySelector('#gameWinBox').style.display = 'block';
    document.querySelector('#restartGame').style.display = 'block';
    document.querySelector('#restart').style.display = 'block';
    document.querySelector('.overlayBox').style.display = 'block';
}

function mainLoop() {
    if (GameState == State.Running) {
        update();
        requestAnimationFrame(mainLoop);
    }
}

function onKeyDown(e) {
    const previousButtons = {...buttonsState};
    if (e.key == 'ArrowRight') {
        buttonsState.right = true;
    } else if (e.key == 'ArrowLeft') {
        buttonsState.left = true;
    } else if (e.key == ' ') {
        buttonsState.space = true;
    }

    buttonsStateChanged(previousButtons, buttonsState);
}

function onKeyUp(e) {
    const previousButtons = {...buttonsState};
    if (e.key == 'ArrowRight') {
        buttonsState.right = false;
    } else if (e.key == 'ArrowLeft') {
        buttonsState.left = false;
    } else if (e.key == ' ') {
        buttonsState.space = false;
    }

    buttonsStateChanged(previousButtons, buttonsState);
}

function onGameRestart(e) {
    player.setX(player.baseX);
    player.setY(player.baseY);
    document.querySelector('#gameOverBox').style.display = 'none';
    document.querySelector('#gameWinBox').style.display = 'none';
    document.querySelector('#restartGame').style.display = 'none';
    document.querySelector('#restart').style.display = 'none';
    document.querySelector('.overlayBox').style.display = 'none';
    GameState = State.Running;
    flags.forEach((f) => f.wasTouched = false);
    stopwatch.restart();
    mainLoop();
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp);
document.querySelector('#restartGame').addEventListener('click', onGameRestart);
document.querySelector('#restart').addEventListener('click', onGameRestart);
requestAnimationFrame(mainLoop);



function isEpsilon(number) {
    return Math.abs(number) < 1e-4;
}