document.addEventListener('DOMContentLoaded', () => {
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
            alert('Please upload an image.');
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing...';
        loader.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        const formData = new FormData(analysisForm);
        const userAnswers = Object.fromEntries(formData.entries());
        delete userAnswers.imageFile;

        try {
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image, answers: userAnswers })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
            }
            displayResults(result.analysis);

        } catch (error) {
            console.error('Fetch Error:', error);
            displayError('Could not connect to the analysis server. Please ensure the backend is running and try again.', error.message);
        } finally {
            loader.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Analyze My Skin';
        }
    });

    function displayResults(htmlContent) {
        resultsContainer.innerHTML = htmlContent;
        resultsContainer.classList.remove('hidden');
    }

    function displayError(message, details = '') {
        const detailText = details ? `<p style="color: #ff9999; font-size: 0.9em; margin-top: 5px;">Details: ${details}</p>` : '';
        resultsContainer.innerHTML = `<p style="color: red; font-weight: bold;">${message}</p>${detailText}`;
        resultsContainer.classList.remove('hidden');
    }
});