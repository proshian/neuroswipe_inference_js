import sys; import os; sys.path.insert(1, os.path.join(os.getcwd(), "yandex-cup-2023-ml-neuroswipe/src"))

from flask import Flask, render_template, jsonify, request

from predict import Predictor

predictor = None
app = Flask(__name__)

# Predictor stores 
# * model with weights
# * data_preproessing_function
# * decoding method

# For some reason the first transfomrer layer would never return anything
# if we initialize predictor here.  Even stranger, this issue happens only
# on pythonfromanywhere.com. We could initialize predictor here if 
# we are running the code locally.
predictor = None

@app.route('/')
def index():
    global predictor 
    predictor = Predictor()
    
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
    predictions = predictor.predict(x,y,t)

    # Return the result as JSON
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)