import os
import re
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure the Gemini API client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not defined in your .env file.")
genai.configure(api_key=api_key)

# Serve the frontend's main HTML file
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files (CSS, JS)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data or 'image' not in data or 'answers' not in data:
            return jsonify({'error': "Missing image or answers."}), 400

        image_data_url = data['image']
        answers = data['answers']

        # Extract MIME type and base64 data from the data URL
        match = re.match(r"data:(.*?);base64,(.*)", image_data_url)
        if not match:
            return jsonify({'error': "Invalid image format."}), 400
        
        mime_type = match.group(1)
        base64_data = match.group(2)
        
        image_part = {
            'mime_type': mime_type,
            'data': base64_data
        }

        prompt = f"""
            Analyze the attached image of a skin condition and the user's answers.
            User's Answers:
            1. Sensation: {answers.get('sensation', 'N/A')}
            2. Duration: {answers.get('duration', 'N/A')}
            3. Description & Changes: {answers.get('description', 'N/A')}
            Based on this information, provide a structured analysis using the following HTML format:
            <h3>Possible Condition</h3><p>Your analysis here...</p>
            <h3>Recommended Approach</h3><p>Your analysis here...</p>
            <h3>Potential Tests a Doctor Might Consider</h3><p>Your analysis here...</p>
            <p><strong>Disclaimer:</strong> This is AI-generated information and is not a substitute for professional medical advice. Consult a qualified dermatologist for an accurate diagnosis.</p>
        """

        # --- THIS LINE IS THE FINAL FIX ---
        model = genai.GenerativeModel('gemini-flash-latest')
        
        response = model.generate_content([prompt, image_part])

        return jsonify({'analysis': response.text})

    except Exception as e:
        print(f"--- DETAILED SERVER ERROR --- \n{e}")
        return jsonify({'error': "An internal server error occurred during AI analysis."}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)