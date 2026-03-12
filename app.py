from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_words', methods=['POST'])
def submit_words():
    words = request.json.get('words', [])
    if len(words) != 16:
        return jsonify({'error': 'Please provide exactly 16 words'}), 400
    return jsonify({'success': True, 'words': words})

if __name__ == '__main__':
    app.run(debug=True)




