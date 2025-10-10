document.addEventListener('DOMContentLoaded', () => {
    // NOTE: Firebase is initialized via script.js, which is loaded before this file.
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    const analysisForm = document.getElementById('analysis-form');
    const imageUploader = document.getElementById('image-uploader');
    const imagePreview = document.getElementById('image-preview');
    const dropZone = document.getElementById('drop-zone');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    
    let base64Image = null;

    // --- File Handling ---
    dropZone.addEventListener('click', () => imageUploader.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
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

    // --- Main Form Submission Logic ---
    analysisForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                if (!base64Image) {
                    alert('Please upload an image for analysis.');
                    return;
                }
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Analyzing...';
                loader.classList.remove('hidden');
                resultsContainer.classList.add('hidden');

                try {
                    await processAndSaveReport(user.uid);
                } catch (error) {
                    console.error('Full process failed:', error);
                    let alertMessage = 'An error occurred during analysis. Please try again.';
                    if (error.message === "Out of Scope") {
                        alertMessage = "Couldn't analyze this image. Please upload a clear image of a supported skin concern.";
                    }
                    alert(alertMessage);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Analyze My Skin';
                    loader.classList.add('hidden');
                }

            } else {
                alert('You must be logged in to perform an analysis.');
                window.location.href = 'login.html';
            }
        });
    });

    /**
     * Orchestrates the entire process: API call, parsing, storage, and redirect.
     */
    async function processAndSaveReport(userId) {
        const geminiResponse = await callGeminiAPI();
        
        if (geminiResponse.includes("Error: Out of Scope")) {
            throw new Error("Out of Scope");
        }

        const reportData = parseGeminiResponse(geminiResponse);
        
        if (!reportData.finding) {
            throw new Error("Could not parse the finding from the AI response.");
        }
        
        const imageUrl = await uploadImageToStorage(userId, base64Image);
        reportData.imageUrl = imageUrl;
        
        const formData = new FormData(analysisForm);
        reportData.sensation = formData.get('sensation');
        reportData.duration = formData.get('duration');
        reportData.description = formData.get('description');
        
        const reportId = await saveReportToFirestore(userId, reportData);

        window.location.href = `report.html?id=${reportId}`;
    }

    /**
     * Calls the Gemini API with the correct model and payload structure.
     */
    async function callGeminiAPI() {
        // IMPORTANT: Replace with your actual API key
        const API_KEY = "AIzaSyDpxo_hsmjxZGQkT--7Tk5CV48WPcZiakI"; 
        
        // FIXED: Using the latest recommended model
        const MODEL_NAME = "gemini-1.5-flash-latest";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const [mimePart, dataPart] = base64Image.split(';base64,');
        const mimeType = mimePart.replace('data:', '');
        
        const validConditions = "Eczema, Psoriasis, Acne, Seborrheic Keratosis, Ringworm, Rosacea, Dermatitis";
        const userAnswers = new FormData(analysisForm);
        const promptText = `
            **Primary Instruction:** You are a specialized AI Dermatological Assistant. Your analysis is strictly limited to the following skin conditions: ${validConditions}.

            **Step 1: Gatekeeping Check.** First, analyze the image. Does it clearly show a potential human skin condition from the list above?
            - If NO (e.g., it's an object, animal, landscape, or a non-listed condition), your ONLY response MUST be the exact string: "Error: Out of Scope". Do not add any other text.
            - If YES, and only if yes, proceed to Step 2.

            **Step 2: Analysis.** If the image passes the Gatekeeping Check, provide your analysis in the following strict Markdown format:

            ### **PRELIMINARY FINDING & RISK ASSESSMENT**
            * **Most Likely Condition:** [Provide ONE specific dermatological condition from the list.]
            * **Confidence Score:** [State a score from 60% to 100%. Just the number.]
            * **Risk Level:** [State LOW, MEDIUM, or HIGH.]

            ### **PATIENT INPUT SUMMARY**
            * **Sensation:** ${userAnswers.get('sensation')}
            * **Duration:** ${userAnswers.get('duration')}
            * **Description:** ${userAnswers.get('description')}

            ### **NEXT STEPS & DISCLAIMER**
            * **Recommended Action 1:** [A specific, non-prescription recommendation.]
            * **Recommended Action 2:** [**MANDATORY:** Always recommend consulting a certified doctor.]
            * **Crucial Disclaimer:** This is NOT a medical diagnosis. Consult a professional dermatologist.
        `;

        const payload = {
            // FIXED: Using the correct payload key 'inlineData'
            contents: [{ parts: [{ inlineData: { mimeType: mimeType, data: dataPart } }, { text: promptText }] }],
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Error Body:", errorBody);
            throw new Error(`API call failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content.parts[0].text) {
            throw new Error("Received an empty or malformed response from the API.");
        }
        return result.candidates[0].content.parts[0].text;
    }

    /**
     * Parses the Markdown response from Gemini into a structured object.
     */
    function parseGeminiResponse(markdown) {
        const data = {};
        const lines = markdown.split('\n');
        
        for (const line of lines) {
            if (line.includes('**Most Likely Condition:**')) {
                data.finding = line.split(':')[1].replace('[', '').replace(']', '').trim();
            } else if (line.includes('**Confidence Score:**')) {
                data.confidence = parseInt(line.split(':')[1].replace('%', '').trim(), 10);
            } else if (line.includes('**Risk Level:**')) {
                data.risk = line.split(':')[1].replace('[', '').replace(']', '').trim();
            }
        }
        return data;
    }

    /**
     * Uploads the base64 image string to Firebase Storage and returns the URL.
     */
    async function uploadImageToStorage(userId, base64) {
        const timestamp = Date.now();
        const storageRef = storage.ref(`reports/${userId}/${timestamp}.jpg`);
        const snapshot = await storageRef.putString(base64, 'data_url');
        return await snapshot.ref.getDownloadURL();
    }

    /**
     * Saves the final report data to Firestore.
     */
    async function saveReportToFirestore(userId, reportData) {
        const reportPayload = {
            ...reportData,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId,
        };
        const docRef = await db.collection('users').doc(userId).collection('reports').add(reportPayload);
        return docRef.id;
    }
});