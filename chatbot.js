document.addEventListener('DOMContentLoaded', () => {
    // Firebase services script.js se aa rahe hain
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage(); // Image upload ke liye

    const analysisForm = document.getElementById('analysis-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    let base64Image = null; // Maan lete hain ki base64Image handleFile se set ho raha hai

    // (Aapka handleFile, drag/drop ka logic yahan aayega...)

    analysisForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const user = auth.currentUser;

        if (user) {
            if (!base64Image) {
                alert('Please upload an image.');
                return;
            }
            submitBtn.disabled = true;
            loader.classList.remove('hidden');

            // 1. Gemini API call (Maan lete hain yeh function response deta hai)
            callGeminiAPI(base64Image)
                .then(geminiResponse => {
                    // 2. Response ko parse karo
                    const reportData = parseGeminiResponse(geminiResponse);
                    reportData.fullReport = geminiResponse; // Poora response bhi save karo

                    // 3. Image ko Firebase Storage mein upload karo
                    return uploadImageToStorage(user.uid, base64Image)
                        .then(imageUrl => {
                            reportData.imageUrl = imageUrl;
                            // 4. Report ko Firestore mein save karo
                            return saveReportToFirestore(user.uid, reportData);
                        });
                })
                .then(reportId => {
                    // 5. Naye report page par redirect karo
                    window.location.href = `report.html?id=${reportId}`;
                })
                .catch(error => {
                    console.error("Analysis failed:", error);
                    alert("Analysis failed. Please try again.");
                    submitBtn.disabled = false;
                    loader.classList.add('hidden');
                });

        } else {
            alert('Please login to start an analysis.');
            window.location.href = 'login.html';
        }
    });

    // Helper functions
    async function callGeminiAPI(base64) {
        // Aapka Gemini API call ka logic yahan
        // Yeh ek dummy response de raha hai
        return Promise.resolve("### PRELIMINARY FINDING & RISK ASSESSMENT\n* **Most Likely Condition:** Mild Eczema\n* **Confidence Score:** 85%\n* **Risk Level:** LOW");
    }

    function parseGeminiResponse(markdown) {
        const data = {};
        if (markdown.includes('**Most Likely Condition:**')) data.finding = markdown.split('**Most Likely Condition:**')[1].split('\n')[0].trim();
        if (markdown.includes('**Confidence Score:**')) data.confidence = parseInt(markdown.split('**Confidence Score:**')[1].split('%')[0].trim());
        if (markdown.includes('**Risk Level:**')) data.risk = markdown.split('**Risk Level:**')[1].split('\n')[0].trim();
        return data;
    }

    async function uploadImageToStorage(userId, base64) {
        const ref = storage.ref(`reports/${userId}/${Date.now()}.jpg`);
        const snapshot = await ref.putString(base64, 'data_url');
        return snapshot.ref.getDownloadURL();
    }

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
