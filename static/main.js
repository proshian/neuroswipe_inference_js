import gnameToGrid from './gridname_to_grid.js';
import {SwipeEmitter} from './swipe_emitter.js';

function fill_keyboard(keyboardElem, keyboardData) {
    const keyboardRect = keyboardElem.getBoundingClientRect();
    const x_coef = keyboardRect.width / keyboardData.width;
    const y_coef = keyboardRect.height / keyboardData.height;

    const keyStyle = {
        top: `${10 * y_coef}px`,
        left: `${6 * x_coef}px`,
        right: `${6 * x_coef}px`,
        bottom: `${10 * y_coef}px`,
        fontSize: `${72 * y_coef}px`,
        borderRadius: `${20 * y_coef}px`,
        boxShadow: `0px ${6 * y_coef}px ${6 * y_coef}px #a3a3a3`,
    };

    keyboardData.keys.forEach((keyData) => {
        const keyHitbox = createKeyHitbox(keyData, x_coef, y_coef);
        const keyElem = createKeyElement(keyData, keyStyle);
        keyHitbox.appendChild(keyElem);
        keyboardElem.appendChild(keyHitbox);
    });
}

function createKeyHitbox(key, x_coef, y_coef) {
    const keyHitbox = document.createElement('div');
    keyHitbox.classList.add('key-hitbox');
    Object.assign(keyHitbox.style, {
        left: `${key.hitbox.x * x_coef}px`,
        top: `${key.hitbox.y * y_coef}px`,
        width: `${key.hitbox.w * x_coef}px`,
        height: `${key.hitbox.h * y_coef}px`,
    });
    return keyHitbox;
}

function createKeyElement(key, keyStyle) {
    const keyElem = document.createElement('div');
    keyElem.classList.add('keyboard-key');
    Object.assign(keyElem.style, keyStyle);
    if (key.label) {
        keyElem.textContent = key.label;
    }
    return keyElem;
}


function empty_keyboard(keyboardElem) {
    while (keyboardElem.firstChild) {
        keyboardElem.removeChild(keyboardElem.firstChild);
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

function showError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
}

function removeError() {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}


async function handleSwipe(event) {
    console.log(event.detail)

    try {
        // Send data to the server
        const response = await fetch('/process_swipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event.detail),
        });

        console.log("Response:")
        console.log(response);

        if (!response.ok) {
            console.log("Response not ok")
            const errorData = await response.json();
            console.log(errorData)
            showError(errorData.error);
        } 
        else {
            console.log("Response ok")
            const predictions = await response.json();
            console.log('Predictions:', predictions);
            updatePredictions(predictions);
        } 
    }
    
    catch (error) {
        console.log('An unexpected error occured.');
        showError('An unexpected error occurred.');
    }
}





const keyboardEl = document.getElementById('keyboard');
keyboardEl.style.height = `${keyboardEl.getBoundingClientRect().width / 2}px`;
keyboardEl.addEventListener('touchstart', () => {clearPredictions(); removeError();});
keyboardEl.addEventListener('mousedown', () => {clearPredictions(); removeError();});

const grid_name = "extra";

fill_keyboard(keyboardEl, gnameToGrid[grid_name]);
const swipeEmitter = new SwipeEmitter(
    keyboardEl, gnameToGrid[grid_name]["width"], gnameToGrid[grid_name]["height"]
);
swipeEmitter.addEventListener('swipe', handleSwipe);

// Refill keyboard each time div size changes
new ResizeObserver(() => {
    keyboardEl.style.height = `${keyboardEl.getBoundingClientRect().width / 2}px`;
    empty_keyboard(keyboardEl)
    fill_keyboard(keyboardEl, gnameToGrid[grid_name])
}).observe(keyboardEl);
