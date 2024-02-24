from flask import Flask, render_template, jsonify, request

from predict import predict

app = Flask(__name__)

@app.route('/')
def index():
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
    predictions = predict(x,y,t)

    # Return the result as JSON
    return jsonify({'predictions': predictions})

if __name__ == '__main__':
    app.run(debug=True)