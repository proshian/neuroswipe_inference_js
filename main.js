function draw_keyboard(canvas, keyboardData) {

    const ctx = canvas.getContext('2d'); 

    keyboardData["keys"].forEach(key => {
        const x = (key.hitbox.x / keyboardData.width) * canvas.width;
        const y = (key.hitbox.y / keyboardData.height) * canvas.height;
        const w = (key.hitbox.w / keyboardData.width) * canvas.width;
        const h = (key.hitbox.h / keyboardData.height) * canvas.height;

        ctx.fillStyle = 'lightgray';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = 'black';
        ctx.fillText(key.label || key.action, x + w / 2, y + h / 2);
    });
}

async function getKeyboardData(path) {
    const res = await fetch(path);
    const json = await res.json();
    return json
}



class SwipeEmiter extends EventTarget{
    constructor(keyboard_el, width, height) {
        super();
        this.keyboard_el = keyboard_el;
        this.grid_width = width
        this.grid_height = height
        this.touchPositions = { x: [], y: [], t: [] };

        keyboard_el.addEventListener('touchstart', this.handleTouchStart.bind(this));
        keyboard_el.addEventListener('touchmove', this.handleTouchMove.bind(this));
        keyboard_el.addEventListener('touchend', this.handleTouchEnd.bind(this));
        keyboard_el.addEventListener('mousedown', this.handleMouseDown.bind(this));
        keyboard_el.addEventListener('mousemove', this.handleMouseMove.bind(this));
        keyboard_el.addEventListener('mouseup', this.handleMouseUp.bind(this));

        keyboard_el.addEventListener
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.touchPositions = { x: [], y: [], t: [] };
        const t = this.t_start = Date.now();
        this.appendTouchPositions(event.touches, t);
    }

    handleTouchMove(event) {
        event.preventDefault();
        const t = Date.now();
        this.appendTouchPositions(event.touches, t);
    }

    handleTouchEnd(event) {
        event.preventDefault();
        const t = Date.now();
        this.appendTouchPositions(event.changedTouches, t);

        const swipeEvent = new CustomEvent('swipe', { detail: this.touchPositions });
        this.dispatchEvent(swipeEvent);
    }

    handleMouseDown(event) {
        event.preventDefault();
        this.touchPositions = { x: [], y: [], t: [] };
        const t = this.t_start = Date.now();
        this.appendTouchPositions([{ clientX: event.clientX, clientY: event.clientY }], t);
    }

    handleMouseMove(event) {
        event.preventDefault();
        const t = Date.now();
        this.appendTouchPositions([{ clientX: event.clientX, clientY: event.clientY }], t);
    }

    handleMouseUp(event) {
        event.preventDefault();
        const t = Date.now();
        this.appendTouchPositions([{ clientX: event.clientX, clientY: event.clientY }], t);
        
        const swipeEvent = new CustomEvent('swipe', { detail: this.touchPositions });
        this.dispatchEvent(swipeEvent);
    }

    appendTouchPositions(touchList, cur_t) {
        const x_coef = this.grid_width / this.keyboard_el.width;
        const y_coef = this.grid_height / this.keyboard_el.height;
        for (const touch of touchList) {
            const x = (touch.clientX - this.keyboard_el.getBoundingClientRect().left) * x_coef;
            const y = (touch.clientY - this.keyboard_el.getBoundingClientRect().top) * y_coef;
            const t = cur_t - this.t_start;
            this.touchPositions.x.push(Math.round(x));
            this.touchPositions.y.push(Math.round(y));
            this.touchPositions.t.push(t);
        }
    }
}


function handleSwipe(event) {
    const x_el = document.getElementById('x');
    const y_el = document.getElementById('y');
    const t_el = document.getElementById('t');

    x_el.innerText = event.detail.x.toString().replaceAll(",", ", ")
    y_el.innerText = event.detail.y.toString().replaceAll(",", ", ")
    t_el.innerText = event.detail.t.toString().replaceAll(",", ", ")
}

const canvas = document.getElementById('keyboardCanvas');
canvas.width = 700;
canvas.height = 350;

getKeyboardData('./keyboardData.json').then((keyboardData) => {
    draw_keyboard(canvas, keyboardData)
    const swipeEmiter = new SwipeEmiter(
        canvas, keyboardData["width"], keyboardData["height"]);
    swipeEmiter.addEventListener('swipe', handleSwipe)
});