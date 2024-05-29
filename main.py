import sys; import os; sys.path.insert(1, os.path.join(os.getcwd(), "yandex-cup-2023-ml-neuroswipe/src"))

from flask import Flask, render_template, jsonify, request

from predict import Predictor

predictor = None
app = Flask(__name__)



@app.route('/')
def index():
    # If predictor is initialized outside any functions in the global scope,
    # First transfomer layer processes forever and never finishes.  This
    # problem happens only when hosted in pythonfromanywhere.com.  Locally
    # we can initialize predictor in the global scope.
    app.config['PREDICTOR'] = Predictor()
    return render_template('index.html')

@app.route('/process_swipe', methods=['POST'])
def process_swipe():
    data = request.get_json()

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