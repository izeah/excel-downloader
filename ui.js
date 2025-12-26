document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTS ---
    const themeToggle = document.getElementById("theme-toggle");
    const html = document.querySelector("html");
    const lightIcon = document.getElementById("theme-icon-light");
    const darkIcon = document.getElementById("theme-icon-dark");
    const loginModal = document.getElementById("login-modal");
    const loginModalBackdrop = document.getElementById("login-modal-backdrop");
    const closeLoginModalBtn = document.getElementById("close-login-modal");
    const userProfile = document.getElementById("user-profile");
    const toastContainer = document.getElementById("toast-container");
    const clearToastsButton = document.getElementById("clear-toasts-button");
    const progressBarContainer = document.getElementById(
        "progressBarContainer"
    );
    const downloadProgressBar = document.getElementById("downloadProgressBar");
    const progressText = document.getElementById("progressText");
    const sidebar = document.getElementById("history-sidebar");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    const historyToggleButton = document.getElementById(
        "history-toggle-button"
    );
    const closeSidebarButton = document.getElementById("close-sidebar-button");
    const historyList = document.getElementById("history-list");
    const mainContent = document.querySelector("main");
    const header = document.querySelector("header");
    const logoutConfirmModal = document.getElementById("logout-confirm-modal");
    const logoutConfirmBackdrop = document.getElementById(
        "logout-confirm-backdrop"
    );
    const logoutConfirmYes = document.getElementById("logout-confirm-yes");
    const logoutConfirmNo = document.getElementById("logout-confirm-no");

    const SIDEBAR_STATE_KEY = "excelDownloaderSidebarState";

    // --- THEME ---
    const applyTheme = (theme) => {
        if (theme === "dark") {
            html.classList.add("dark");
            lightIcon.classList.add("hidden");
            darkIcon.classList.remove("hidden");
        } else {
            html.classList.remove("dark");
            lightIcon.classList.remove("hidden");
            darkIcon.classList.add("hidden");
        }
        setTimeout(() => initParticles(theme), 10);
    };

    // --- MODALS ---
    const showModal = (modal, backdrop) => {
        modal.classList.remove("hidden");
        backdrop.classList.remove("hidden");
        setTimeout(() => modal.classList.remove("scale-95", "opacity-0"), 10);
    };
    const hideModal = (modal, backdrop) => {
        modal.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
            modal.classList.add("hidden");
            backdrop.classList.add("hidden");
        }, 200);
    };
    window.showLoginModal = () => showModal(loginModal, loginModalBackdrop);
    window.hideLoginModal = () => hideModal(loginModal, loginModalBackdrop);
    window.showLogoutConfirmModal = () =>
        showModal(logoutConfirmModal, logoutConfirmBackdrop);
    window.hideLogoutConfirmModal = () =>
        hideModal(logoutConfirmModal, logoutConfirmBackdrop);

    // --- SIDEBAR ---
    const showSidebar = () => {
        sidebar.classList.remove("-translate-x-full");
        sidebarBackdrop.classList.remove("hidden");
        mainContent.classList.add("md:pl-72");
        header.classList.add("md:pl-78");
        historyToggleButton.classList.add("hidden");
        localStorage.setItem(SIDEBAR_STATE_KEY, "open");
    };
    const hideSidebar = () => {
        sidebar.classList.add("-translate-x-full");
        sidebarBackdrop.classList.add("hidden");
        mainContent.classList.remove("md:pl-72");
        header.classList.remove("md:pl-78");
        historyToggleButton.classList.remove("hidden");
        localStorage.setItem(SIDEBAR_STATE_KEY, "closed");
    };
    window.showSidebar = showSidebar;
    window.hideSidebar = hideSidebar;
    window.renderHistorySidebar = (history) => {
        historyList.innerHTML = "";
        if (history.length === 0) {
            historyList.innerHTML =
                '<p class="text-center text-sm text-muted-foreground p-4">No history yet.</p>';
            return;
        }
        history.forEach((item) => {
            const div = document.createElement("div");
            div.className =
                "history-item p-3 rounded-lg hover:bg-accent cursor-pointer";
            div.dataset.url = item.url;
            div.dataset.method = item.method;
            div.innerHTML = `<div class="flex items-center justify-between"><p class="text-sm font-semibold truncate">${item.url}</p><span class="text-xs font-mono px-2 py-1 rounded-full bg-secondary text-secondary-foreground">${item.method}</span></div>`;
            historyList.appendChild(div);
        });
    };

    // --- TOASTS ---
    const MAX_TOASTS = 5;
    const updateClearToastsButtonVisibility = () => {
        const toastCount =
            toastContainer.querySelectorAll(":scope > div.toast").length;
        clearToastsButton.classList.toggle("hidden", toastCount === 0);
    };
    const removeToast = (toast) => {
        toast.classList.add("opacity-0");
        setTimeout(() => {
            toast.remove();
            updateClearToastsButtonVisibility();
        }, 300);
    };
    window.showToast = (
        message,
        options = { type: "info", details: "", fileName: "" }
    ) => {
        const existingToasts =
            toastContainer.querySelectorAll(":scope > div.toast");
        if (existingToasts.length >= MAX_TOASTS) {
            removeToast(existingToasts[0]);
        }
        const toast = document.createElement("div");
        toast.className =
            "toast transform transition-all duration-300 ease-in-out translate-x-full";
        let bgColor, textColor, icon;
        switch (options.type) {
            case "success":
                bgColor = "bg-green-100 dark:bg-green-900 border-green-500";
                textColor = "text-green-800 dark:text-green-200";
                icon = "fa-check-circle";
                break;
            case "error":
                bgColor = "bg-red-100 dark:bg-red-900 border-red-500";
                textColor = "text-red-800 dark:text-red-200";
                icon = "fa-exclamation-circle";
                break;
            default:
                bgColor = "bg-blue-100 dark:bg-blue-900 border-blue-500";
                textColor = "text-blue-800 dark:text-blue-200";
                icon = "fa-info-circle";
                break;
        }
        toast.innerHTML = `<div class="w-full rounded-lg border ${bgColor} p-4 shadow-lg"><div class="flex items-start"><i class="fas ${icon} ${textColor} mt-1"></i><div class="ml-3 flex-1"><p class="text-sm font-medium ${textColor}">${message}</p>${
            options.details
                ? `<p class="mt-1 text-sm text-muted-foreground">${options.details}</p>`
                : ""
        }${
            options.type === "success"
                ? `<div class="mt-2"><button data-filename="${options.fileName}" class="retry-download-link text-sm font-medium text-primary hover:underline">Try again</button></div>`
                : ""
        }</div><button class="ml-4 flex-shrink-0 close-toast"><i class="fas fa-times text-muted-foreground hover:text-foreground"></i></button></div></div>`;
        toastContainer.insertBefore(toast, clearToastsButton);
        updateClearToastsButtonVisibility();
        setTimeout(() => {
            toast.classList.remove("translate-x-full");
        }, 100);
        toast
            .querySelector(".close-toast")
            .addEventListener("click", () => removeToast(toast));
    };

    // --- UI UPDATES ---
    window.updateProgress = (percentage, text) => {
        if (percentage === 0 && text === "") {
            progressBarContainer.classList.add("hidden");
            return;
        }
        progressBarContainer.classList.remove("hidden");
        downloadProgressBar.style.width = `${percentage}%`;
        progressText.innerText = text;
    };
    window.updateUIForLogin = (user) => {
        if (user) {
            userProfile.classList.remove("hidden");
            const displayUsername = user.name || user.email || "User";
            document.getElementById("user-initials").textContent =
                displayUsername.charAt(0).toUpperCase();
            document.getElementById("username-display").textContent =
                displayUsername;
        }
    };
    window.updateUIForLogout = () => {
        userProfile.classList.add("hidden");
    };

    // --- PARTICLES.JS ---
    const initParticles = (theme) => {
        const color = theme === "dark" ? "#ffffff" : "#000000";
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: { enable: true, value_area: 800 },
                },
                color: { value: color },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: color,
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                },
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    resize: true,
                },
                modes: { grab: { distance: 140, line_opacity: 1 } },
            },
            retina_detect: true,
        });
    };

    // --- INITIALIZATION & EVENT LISTENERS ---
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
    themeToggle.addEventListener("click", () => {
        const newTheme = html.classList.contains("dark") ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    });
    closeLoginModalBtn.addEventListener("click", window.hideLoginModal);
    loginModalBackdrop.addEventListener("click", window.hideLoginModal);
    logoutConfirmNo.addEventListener("click", window.hideLogoutConfirmModal);
    logoutConfirmBackdrop.addEventListener(
        "click",
        window.hideLogoutConfirmModal
    );
    historyToggleButton.addEventListener("click", showSidebar);
    closeSidebarButton.addEventListener("click", hideSidebar);
    sidebarBackdrop.addEventListener("click", hideSidebar);
    historyList.addEventListener("click", (e) => {
        const item = e.target.closest(".history-item");
        if (item) {
            document.getElementById("apiUrl").value = item.dataset.url;
            document.getElementById("httpMethod").value = item.dataset.method;
            if (window.innerWidth < 768) {
                hideSidebar();
            }
        }
    });
    clearToastsButton.addEventListener("click", () => {
        toastContainer
            .querySelectorAll(":scope > div.toast")
            .forEach((toast) => removeToast(toast));
    });
    if (userProfile) {
        const avatarButton = document.getElementById("user-avatar-button");
        const dropdown = document.getElementById("logout-dropdown");
        avatarButton.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
        });
        document.addEventListener("click", () => {
            if (!dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
            }
        });
        document
            .getElementById("logout-button")
            .addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.classList.add("hidden");
                window.showLogoutConfirmModal();
            });
    }
    logoutConfirmYes.addEventListener("click", () => {
        if (window.performLogout) {
            window.performLogout();
        }
        window.hideLogoutConfirmModal();
    });
    initParticles(savedTheme);
});
