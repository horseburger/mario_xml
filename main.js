



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
                return true;
            }

            if (!this.isTouchingFloorRight(this.getX(), this.getY(), floor)
                && this.isTouchingFloorRight(this.getX() + delta, this.getY(), floor)) {
                return true;
            }
        }

        return false;
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
            delta = 0;
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
                return true;
            }
        }

        return false;
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
                return true;
            }
        }

        return false;
    }

    update() {
        this.moveSides();
        
        this.currentVelocity += GravityFactor;
        if (this.jump && this.willBeOnFloor(GravityFactor)) {
            this.currentVelocity = -this.jumpSpeed;
            this.jump = false;
        }

        if (this.willBeOnFloor(this.currentVelocity) || this.willTouchCeil(this.currentVelocity)) {
            this.currentVelocity = 0;
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