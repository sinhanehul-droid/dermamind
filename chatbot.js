document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // WARNING: For temporary testing ONLY. Do not use in production.
    // Replace "YOUR_GEMINI_API_KEY_HERE" with your actual key.
    const API_KEY = "AIzaSyDpxo_hsmjxZGQkT--7Tk5CV48WPcZiakI";
    const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    // =================================================================

    const analysisForm = document.getElementById('analysis-form');
    const dropZone = document.getElementById('drop-zone');
    const imageUploader = document.getElementById('image-uploader');
    const imagePreview = document.getElementById('image-preview');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    
    let base64Image = null;

    dropZone.addEventListener('click', () => imageUploader.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });
    imageUploader.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            dropZone.querySelector('p').style.display = 'none';
            base64Image = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    
    analysisForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!base64Image) {
            displayError('Please upload an image for analysis.');
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing...';
        loader.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        const formData = new FormData(analysisForm);
        const userAnswers = Object.fromEntries(formData.entries());
        
        console.log("Starting Gemini API call using Model:", MODEL_NAME);

        try {
            const result = await callGeminiAPI(base64Image, userAnswers);
            displayResults(result);
        } catch (error) {
            console.error('API Error:', error);
            displayError('Analysis failed. Please check the browser console for details (F12 -> Console). Common issues: Invalid API Key or CORS block.');
        } finally {
            loader.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Analyze My Skin';
        }
    });
    
    async function callGeminiAPI(base64Image, userAnswers) {
        const [mimePart, dataPart] = base64Image.split(';base64,');
        const mimeType = mimePart.replace('data:', '');
        
        const promptText = `
            You are a specialized AI Dermatological Assistant. Your primary goal is to provide a **preliminary finding and risk assessment** based on the visual evidence and patient's subjective input.

            **STRICT RESPONSE FORMAT:** Your entire response must be professional, supportive, and contain the following sections using Markdown:

            ### **PRELIMINARY FINDING & RISK ASSESSMENT (MANDATORY)**
            * **Most Likely Condition (Diagnosis):** [Provide ONE specific dermatological condition, e.g., 'Mild Eczema', 'Psoriasis', 'Seborrheic Keratosis'. If uncertain, state the closest possibility.]
            * **Confidence Score:** [State a score from 60% to 100% based on visual and textual alignment.]
            * **Risk Level:** [State LOW, MEDIUM, or HIGH.]

            ### **PATIENT INPUT SUMMARY**
            * **Sensation:** ${userAnswers.sensation}
            * **Duration:** ${userAnswers.duration}
            * **Description:** ${userAnswers.description}

            ### **NEXT STEPS & DISCLAIMER**
            * **Recommended Action 1:** [A specific, non-prescription recommendation, e.g., 'Apply a fragrance-free moisturizer twice daily.']
            * **Recommended Action 2:** [**MANDATORY:** Always recommend consulting a certified doctor.]
            * **Crucial Disclaimer:** This is NOT a medical diagnosis. Consult a professional dermatologist immediately for definitive treatment.
        `;

        const payload = {
            contents: [{
                parts: [
                    { inlineData: { mimeType: mimeType, data: dataPart } },
                    { text: promptText }
                ]
            }],
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Server Response Error:", errorBody);
            throw new Error(`API call failed: ${response.statusText}. Details in console.`);
        }
        
        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts[0].text) {
             throw new Error("Received an empty or malformed response from the API.");
        }
        
        return result.candidates[0].content.parts[0].text;
    }

    function displayResults(markdownText) {
        let htmlContent = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlContent = htmlContent.replace(/\n### (.*?)<br>/g, '<h4 style="color: var(--accent-gold); margin-top: 15px;">$1</h4>');
        htmlContent = htmlContent.replace(/\n\* (.*?)<br>/g, '<li style="list-style-type: disc; margin-left: 20px;">$1</li>');
        htmlContent = htmlContent.replace(/\n/g, '<br>');
        
        resultsContainer.innerHTML = `
            <h3>AI Analysis Report</h3>
            <div style="padding: 15px; background: #222; border-radius: 8px; line-height: 1.8;">
                ${htmlContent}
            </div>
            <a href="doctors.html" id="findDoctorsBtn" class="btn" style="display: block; text-align: center; margin-top: 20px; background-color: var(--accent-gold); color: #000; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none;">
                Find Local Dermatologists
            </a>
        `;
        resultsContainer.classList.remove('hidden');
    }

    function displayError(message) {
        resultsContainer.innerHTML = `<p style="color: #ff6347; font-weight: bold; background: #333; padding: 10px; border-radius: 8px;">${message}</p>`;
        resultsContainer.classList.remove('hidden');
    }
});