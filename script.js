document.addEventListener("DOMContentLoaded", () => {
    const downloadForm = document.getElementById("downloadForm");
    const apiUrlInput = document.getElementById("apiUrl");
    const httpMethodSelect = document.getElementById("httpMethod");
    const downloadButton = document.getElementById("downloadButton");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logout-button");
    const urlHistoryList = document.getElementById("url-history");

    let lastRequestArgs = null;
    const URL_HISTORY_KEY = "excelDownloaderUrlHistory";

    // --- UTILS ---
    const getAuthToken = () => sessionStorage.getItem("authToken");
    const getUser = () => {
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    };

    const saveUrlToHistory = (url) => {
        let history = getUrlHistory();
        if (history.includes(url)) {
            history = history.filter((u) => u !== url);
        }
        history.unshift(url);
        history = history.slice(0, 10);
        localStorage.setItem(URL_HISTORY_KEY, JSON.stringify(history));
        loadUrlHistory();
    };

    const getUrlHistory = () => {
        const history = localStorage.getItem(URL_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    };

    const loadUrlHistory = () => {
        const history = getUrlHistory();
        urlHistoryList.innerHTML = "";
        history.forEach((url) => {
            const option = document.createElement("option");
            option.value = url;
            urlHistoryList.appendChild(option);
        });
    };

    // --- CORE DOWNLOAD LOGIC ---
    const downloadFile = async (url, method) => {
        lastRequestArgs = { url, method };

        downloadButton.disabled = true;
        downloadButton.innerText = "Downloading...";
        window.updateProgress(0, "Preparing to download...");

        const token = getAuthToken();
        const headers = new Headers();
        if (token) {
            headers.append("Authorization", `Bearer ${token}`);
        }

        try {
            const response = await fetch(url, { method, headers });

            if (response.status === 401) {
                window.showLoginModal();
                downloadButton.disabled = false;
                downloadButton.innerText = "Download";
                window.updateProgress(0, "");
                return;
            }

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ message: "An unknown error occurred." }));
                throw new Error(
                    errorData.message ||
                        `HTTP error! Status: ${response.status}`
                );
            }

            const contentDisposition = response.headers.get(
                "content-disposition"
            );
            const contentDescription =
                response.headers.get("content-description") ||
                "Downloaded file";
            let filename = "downloaded.xlsx";
            if (contentDisposition) {
                const filenameMatch =
                    contentDisposition.match(/filename="?(.+?)"?$/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const contentLength = response.headers.get("content-length");
            const total = parseInt(contentLength, 10);
            let loaded = 0;

            const reader = response.body.getReader();
            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader
                            .read()
                            .then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                loaded += value.length;
                                if (total) {
                                    const percentage = Math.round(
                                        (loaded / total) * 100
                                    );
                                    window.updateProgress(
                                        percentage,
                                        `Downloading ${filename}...`
                                    );
                                }
                                controller.enqueue(value);
                                push();
                            })
                            .catch((error) => {
                                console.error("Stream reading error:", error);
                                controller.error(error);
                            });
                    }
                    push();
                },
            });

            const blob = await new Response(stream).blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            window.updateProgress(100, `Completed!`);
            setTimeout(() => window.updateProgress(0, ""), 2000);

            window.showToast("Download Successful!", {
                type: "success",
                details: contentDescription,
                fileName: filename,
            });

            saveUrlToHistory(url);
        } catch (error) {
            window.showToast("Download Failed", {
                type: "error",
                details: error.message,
            });
            window.updateProgress(0, "");
        } finally {
            downloadButton.disabled = false;
            downloadButton.innerText = "Download";
        }
    };

    // --- AUTHENTICATION LOGIC ---
    const handleLogin = async (email, password) => {
        try {
            // NOTE: Replace with your actual login API endpoint
            const response = await fetch(
                "http://localhost:3000/v1/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            sessionStorage.setItem("authToken", data.data.token);
            sessionStorage.setItem(
                "user",
                JSON.stringify({
                    name: data.data.user.name,
                    email: data.data.user.email,
                })
            );

            window.hideLoginModal();
            window.updateUIForLogin(data.data.user);

            // If a download was pending, retry it
            if (lastRequestArgs) {
                window.showToast("Login successful! Retrying download...", {
                    type: "info",
                });
                await downloadFile(lastRequestArgs.url, lastRequestArgs.method);
                lastRequestArgs = null;
            }
        } catch (error) {
            window.showToast("Login Failed", {
                type: "error",
                details: error.message,
            });
        }
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("user");
            window.updateUIForLogout();
            window.showToast("You have been logged out.", { type: "info" });
        }
    };

    // --- EVENT LISTENERS ---
    downloadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const url = apiUrlInput.value;
        const method = httpMethodSelect.value;
        downloadFile(url, method);
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        handleLogin(email, password);
    });

    logoutButton.addEventListener("click", handleLogout);

    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("retry-download-link")) {
            event.preventDefault();
            if (lastRequestArgs) {
                window.showToast(
                    `Retrying download for: ${lastRequestArgs.url}`,
                    { type: "info" }
                );
                downloadFile(lastRequestArgs.url, lastRequestArgs.method);
            } else {
                window.showToast("No recent download to retry.", {
                    type: "error",
                });
            }
        }
    });

    // --- INITIALIZATION ---
    const initialize = () => {
        const user = getUser();
        if (user) {
            window.updateUIForLogin(user);
        }
        loadUrlHistory();
    };

    initialize();
});
