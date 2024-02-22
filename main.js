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



class SwipeHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.touchPositions = { x: [], y: [], t: [] };

        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
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

        console.log(this.touchPositions);


        const x_el = document.getElementById('x');
        const y_el = document.getElementById('y');
        const t_el = document.getElementById('t');

        x_el.innerText = this.touchPositions.x.toString().replaceAll(",", ", ")
        y_el.innerText = this.touchPositions.y.toString().replaceAll(",", ", ")
        t_el.innerText = this.touchPositions.t.toString().replaceAll(",", ", ")
    }

    appendTouchPositions(touchList, cur_t) {
        for (const touch of touchList) {
            const x = touch.clientX - this.canvas.getBoundingClientRect().left;
            const y = touch.clientY - this.canvas.getBoundingClientRect().top;
            const t = cur_t - this.t_start;
            this.touchPositions.x.push(Math.round(x));
            this.touchPositions.y.push(Math.round(y));
            this.touchPositions.t.push(t);
        }
    }
}


const canvas = document.getElementById('keyboardCanvas');
canvas.width = 700;
canvas.height = 350;

getKeyboardData('./keyboardData.json').then((keyboardData) => {draw_keyboard(canvas, keyboardData)});

const swipeHandler = new SwipeHandler(canvas);