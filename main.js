



let buttonsState = {'right': false, 'left': false, 'space': false};
const GravityFactor = 0.5;

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
}


const floors = [...document.querySelectorAll('.floor')].map((f) => new Entity(f));

class Player extends Entity {
    constructor(svg) {
        super(svg);
        this.sideSpeed = 5.0;
        this.jumpSpeed = 15;
        
        this.rightMovement = false;
        this.leftMovement = false;

        this.jump = false;
        this.currentVelocity = 0;
    }

    onButtonsStateChanged(prev, next) {
        this.rightMovement = next.right;
        this.leftMovement = next.left;


        if (!prev.space && next.space) {
            this.jump = true;
        }
    }

    moveSides() {
        let delta = 0;
        if (this.rightMovement) {
            delta += this.sideSpeed;
        }
        if (this.leftMovement) {
            delta -= this.sideSpeed;
        }

        this.setX(this.getX() + delta);
    }

    isAfterFloor(x, y, floor) {
        const pY = y + this.getHeight();
        const pX = x + this.getWidth();

        if (pX < floor.getX()) return false;
        if (x > floor.getX() + floor.getWidth()) return false;

        if (pY - floor.getY() > -0.5) {
            return true;
        }

        return false;
    }
    update() {
        this.moveSides();
        
        this.currentVelocity += GravityFactor;
        if (this.jump) {
            this.currentVelocity = -this.jumpSpeed;
            this.jump = false;
        }

        for (let floor of floors) {
            if (!this.isAfterFloor(this.getX(), this.getY(), floor)
                && this.isAfterFloor(this.getX(), this.getY() + this.currentVelocity, floor)) {
                this.currentVelocity = 0;
                break;
            }
        }
        

        this.setY(this.getY() + this.currentVelocity);

    }
}


const player = new Player(document.querySelector('#player'));

function update() {
    player.update();
}

function buttonsStateChanged(prev, next)  {
    player.onButtonsStateChanged(prev, next);
}

function mainLoop() {
    update();
    requestAnimationFrame(mainLoop);
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

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp);
requestAnimationFrame(mainLoop);

function isEpsilon(number) {
    return Math.abs(number) < 1e-4;
}