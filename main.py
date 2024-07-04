import sys; import os; sys.path.insert(1, os.path.join(os.getcwd(), "yandex-cup-2023-ml-neuroswipe/src"))

from flask import Flask, render_template, jsonify, request

from predict_inference import Predictor
from input_validatoin import is_input_valid

app = Flask(__name__)
app.config['PREDICTOR'] = None


@app.route('/')
def index():
    # If predictor is initialized outside any functions in the global scope,
    # First transfomer layer processes forever and never finishes.  This
    # problem happens only when hosted in pythonfromanywhere.com.  Locally
    # we can initialize predictor in the global scope.
    if app.config['PREDICTOR'] is None:
        app.config['PREDICTOR'] = Predictor()
    return render_template('index.html')

@app.route('/process_swipe', methods=['POST'])
def process_swipe():
    data = request.get_json()

    is_input_ok, inpt_valid_msg = is_input_valid(data)
    if not is_input_ok:
        return jsonify({'error': inpt_valid_msg}), 400

    # Extract x, y, t from the JSON request
    x = data.get('x')
    y = data.get('y')
    t = data.get('t')

    # Process the data (for now, just return a simple string)
    # predictions = [f"dummy_prediction_{i}" for i in range(4)]
    predictions = app.config['PREDICTOR'].predict(x,y,t)

    # Return the result as JSON
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
