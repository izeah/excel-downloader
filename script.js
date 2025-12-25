document.addEventListener('DOMContentLoaded', () => {
    // General Elements
    const downloadForm = document.getElementById('downloadForm');
    const apiUrlInput = document.getElementById('apiUrl');
    const downloadButton = document.getElementById('downloadButton');

    // Progress Bar Elements
    const progressBarContainer = document.getElementById('progressBarContainer');
    const downloadProgressBar = document.getElementById('downloadProgressBar');
    const progressText = document.getElementById('progressText');

    // Modals
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));

    // Modal-specific Elements
    const errorMessageElement = document.getElementById('errorMessage');
    const retryDownloadLink = document.getElementById('retryDownloadLink');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginErrorElement = document.getElementById('loginError');

    // State
    let authToken = sessionStorage.getItem('authToken');
    let lastBlobUrl = null;

    /**
     * Initiates the file download process.
     */
    async function initiateDownload() {
        const url = apiUrlInput.value;
        if (!url) {
            showError('URL API tidak boleh kosong.');
            return;
        }

        // --- UI Setup ---
        downloadButton.disabled = true;
        progressBarContainer.style.display = 'block';
        updateProgress(0, 'Mempersiapkan download...');

        try {
            // --- Simulate initial progress ---
            const progressInterval = startProgressSimulation();

            // --- Fetch Request ---
            const headers = {
                'Content-Type': 'application/json'
            };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({})
            });
            
            // --- Process Response ---
            clearInterval(progressInterval);
            updateProgress(100, 'Memproses file...');

            if (response.status === 401) {
                // Unauthorized: Clear old token and prompt for login
                authToken = null;
                sessionStorage.removeItem('authToken');
                loginModal.show();
                // Hide progress bar as we are now in login flow
                progressBarContainer.style.display = 'none';
                downloadButton.disabled = false;
                return; // Stop the download process
            }

            if (!response.ok) {
                const errorDetails = await getErrorDetails(response);
                throw new Error(`Gagal mengambil file: ${errorDetails}`);
            }

            const filename = getFilenameFromHeaders(response.headers);
            const blob = await response.blob();
            
            if (lastBlobUrl) {
                URL.revokeObjectURL(lastBlobUrl); // Clean up previous blob URL
            }
            lastBlobUrl = URL.createObjectURL(blob);

            // --- Trigger Download & Show Success ---
            triggerFileDownload(lastBlobUrl, filename);
            successModal.show();

        } catch (error) {
            showError(error.message);
        } finally {
            // --- Final UI State ---
            if (!loginModal._isShown) { // Don't re-enable if login modal is active
                downloadButton.disabled = false;
                progressBarContainer.style.display = 'none';
            }
        }
    }
    
    /**
     * Handles the login form submission.
     */
    async function handleLogin(event) {
        event.preventDefault();
        loginErrorElement.style.display = 'none';
        const loginUrl = 'http://localhost:3000/v1/auth/login';

        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login gagal.');
            }

            if (result.data && result.data.token) {
                authToken = result.data.token;
                sessionStorage.setItem('authToken', authToken);
                loginModal.hide();
                
                // Automatically retry the download after successful login
                initiateDownload(); 
            } else {
                throw new Error('Token tidak ditemukan dalam respons.');
            }

        } catch (error) {
            loginErrorElement.textContent = error.message;
            loginErrorElement.style.display = 'block';
        }
    }

    // --- Helper Functions ---

    function showError(message) {
        errorMessageElement.textContent = message || 'Terjadi kesalahan tidak dikenal.';
        errorModal.show();
    }

    function updateProgress(percentage, text) {
        downloadProgressBar.style.width = `${percentage}%`;
        downloadProgressBar.setAttribute('aria-valuenow', percentage);
        downloadProgressBar.textContent = `${percentage}%`;
        progressText.textContent = text;
    }
    
    function startProgressSimulation() {
        updateProgress(0, 'Menghubungi server...');
        let currentProgress = 0;
        return setInterval(() => {
            if (currentProgress < 90) {
                currentProgress += Math.floor(Math.random() * 5) + 1;
                if (currentProgress > 90) currentProgress = 90;
                updateProgress(currentProgress, `Mengunduh... ${currentProgress}%`);
            }
        }, 400);
    }
    
    async function getErrorDetails(response) {
        let details = `Status: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            details += ` - Pesan: ${errorData.message || JSON.stringify(errorData)}`;
        } catch {
            // Can't parse JSON, use text
            const errorText = await response.text();
            if (errorText) details += ` - ${errorText.substring(0, 100)}...`;
        }
        return details;
    }

    function getFilenameFromHeaders(headers) {
        const contentDisposition = headers.get('Content-Disposition');
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) return match[1];
        }
        return 'download.xlsx'; // Fallback filename
    }
    
    function triggerFileDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // --- Event Listeners ---
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        initiateDownload();
    });

    loginForm.addEventListener('submit', handleLogin);

    retryDownloadLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (lastBlobUrl) {
            triggerFileDownload(lastBlobUrl, getFilenameFromHeaders(new Headers()));
        } else {
            showError('Tidak ada file sebelumnya untuk diunduh ulang. Silakan coba download baru.');
        }
    });

});