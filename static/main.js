import gnameToGrid from './gridname_to_grid.js';


function fill_keyboard(keyboardElem, keyboardData) {
    keyboardData.keys.forEach(key => {
        const x_coef = keyboardElem.getBoundingClientRect().width / keyboardData.width;
        const y_coef = keyboardElem.getBoundingClientRect().height / keyboardData.height;

        const keyElem = document.createElement('div');
        keyElem.classList.add('key-hitbox');
        keyElem.textContent = key.label || key.action;
        keyElem.style.left = key.hitbox.x * x_coef + 'px';
        keyElem.style.top = key.hitbox.y * y_coef + 'px';
        keyElem.style.width = key.hitbox.w * x_coef + 'px';
        keyElem.style.height = key.hitbox.h * y_coef + 'px';
        keyboardElem.appendChild(keyElem);
    })
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
        const x_coef = this.grid_width / this.keyboard_el.getBoundingClientRect().width;
        const y_coef = this.grid_height / this.keyboard_el.getBoundingClientRect().height;
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


function updatePredictions(predictions) {
    predictions.forEach((value, index) => {
        document.getElementById('pred-' + index).innerText = value;
    })
}

function clearPredictions() {
    const n_predictions = 4
    for (let i=0; i < n_predictions; i++) {
        document.getElementById('pred-' + i).innerText = '';
    }
}


function handleSwipe(event) {
    console.log(event.detail)
    // const x_el = document.getElementById('x');
    // const y_el = document.getElementById('y');
    // const t_el = document.getElementById('t');

    // x_el.innerText = event.detail.x.toString().replaceAll(",", ", ")
    // y_el.innerText = event.detail.y.toString().replaceAll(",", ", ")
    // t_el.innerText = event.detail.t.toString().replaceAll(",", ", ")


    // Send data to the server
    fetch('/process_swipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event.detail),
    })
    .then(response => response.json())
    .then(result => {
        // Handle the result from the server
        console.log(result);
        updatePredictions(result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



const keyboardEl = document.getElementById('keyboard');
keyboardEl.style.height = keyboardEl.getBoundingClientRect().width / 2 + 'px'; 
keyboardEl.addEventListener('touchstart', (ev) => {clearPredictions()})
keyboardEl.addEventListener('mousedown', (ev) => {clearPredictions()})

const grid_name = "extra"

fill_keyboard(keyboardEl, gnameToGrid[grid_name])
const swipeEmiter = new SwipeEmiter(
    keyboardEl, gnameToGrid[grid_name]["width"], gnameToGrid[grid_name]["height"]);
swipeEmiter.addEventListener('swipe', handleSwipe)
