export class SwipeEmitter extends EventTarget{
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

        // mouseeeConfig = {
        //     showTrail: true,
        // };
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

        // mouseeeConfig = {
        //     showTrail: false,
        // };
    }

    handleMouseDown(event) {
        event.preventDefault();
        this.touchPositions = { x: [], y: [], t: [] };
        const t = this.t_start = Date.now();
        this.appendTouchPositions([{ clientX: event.clientX, clientY: event.clientY }], t);

        // mouseeeConfig = {
        //     showTrail: true,
        // };
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

        // mouseeeConfig = {
        //     showTrail: false,
        // };
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
