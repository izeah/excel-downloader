document.addEventListener("DOMContentLoaded", () => {
    // Theme toggling
    const themeToggle = document.getElementById("theme-toggle");
    const html = document.querySelector("html");
    const lightIcon = document.getElementById("theme-icon-light");
    const darkIcon = document.getElementById("theme-icon-dark");

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
    };

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const newTheme = html.classList.contains("dark") ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    });

    // Login Modal
    const loginModal = document.getElementById("login-modal");
    const loginModalBackdrop = document.getElementById("login-modal-backdrop");
    const closeLoginModalBtn = document.getElementById("close-login-modal");

    window.showLoginModal = () => {
        loginModal.classList.remove("hidden");
        loginModalBackdrop.classList.remove("hidden");
        setTimeout(() => {
            loginModal.classList.remove("scale-95", "opacity-0");
        }, 10);
    };

    window.hideLoginModal = () => {
        loginModal.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
            loginModal.classList.add("hidden");
            loginModalBackdrop.classList.add("hidden");
        }, 200);
    };

    closeLoginModalBtn.addEventListener("click", window.hideLoginModal);
    loginModalBackdrop.addEventListener("click", window.hideLoginModal);

    // User Profile Dropdown
    const userProfile = document.getElementById("user-profile");
    if (userProfile) {
        const avatar = userProfile.querySelector(".relative");
        const helloUser = document.getElementById("hello-user");
        const dropdown = document.getElementById("logout-dropdown");

        avatar.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
        });

        helloUser.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", () => {
            if (!dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
            }
        });
    }

    // Toast Notifications
    const toastContainer = document.getElementById("toast-container");
    const MAX_TOASTS = 5;

    window.showToast = (
        message,
        options = { type: "info", details: "", fileName: "" }
    ) => {
        // Remove oldest toast if limit is reached
        if (toastContainer.children.length >= MAX_TOASTS) {
            toastContainer.removeChild(toastContainer.firstChild);
        }

        const toast = document.createElement("div");
        toast.className = `transform transition-all duration-300 ease-in-out translate-x-full`;

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

        let toastContent = `
            <div class="flex items-start">
                <i class="fas ${icon} ${textColor} mt-1"></i>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium ${textColor}">${message}</p>
                    ${
                        options.details
                            ? `<p class="mt-1 text-sm ${textColor}">${options.details}</p>`
                            : ""
                    }
                    ${
                        options.type === "success"
                            ? `
                        <div class="mt-2">
                            <button data-filename="${options.fileName}" class="retry-download-link text-sm font-medium ${textColor} hover:underline cursor-pointer">
                                Try again
                            </button>
                        </div>
                    `
                            : ""
                    }
                </div>
                <button class="ml-4 flex-shrink-0">
                    <i class="fas fa-times ${textColor}"></i>
                </button>
            </div>
        `;

        toast.innerHTML = `<div class="w-full rounded-lg border ${bgColor} p-4 shadow-lg">${toastContent}</div>`;

        toast.querySelector("button.ml-4").addEventListener("click", () => {
            toast.classList.add("opacity-0", "translate-x-full");
            setTimeout(() => toast.remove(), 300);
        });

        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove("translate-x-full");
        }, 100);
    };

    // Progress Bar
    const progressBarContainer = document.getElementById(
        "progressBarContainer"
    );
    const downloadProgressBar = document.getElementById("downloadProgressBar");
    const progressText = document.getElementById("progressText");

    window.updateProgress = (percentage, text) => {
        if (percentage === 0 && text === "") {
            progressBarContainer.classList.add("hidden");
            return;
        }

        progressBarContainer.classList.remove("hidden");
        downloadProgressBar.style.width = `${percentage}%`;
        downloadProgressBar.innerText = `${percentage}%`;
        progressText.innerText = text;
    };

    window.updateUIForLogin = (user) => {
        const userProfileDiv = document.getElementById("user-profile");
        const userInitials = document.getElementById("user-initials");
        const usernameSpan = document.getElementById("username");

        if (user) {
            userProfileDiv.classList.remove("hidden");
            userProfileDiv.classList.add("flex");
            // Use user.name, fallback to user.email, or 'User' if neither is available
            const displayUsername = user.name || user.email || "User";
            userInitials.textContent = displayUsername.charAt(0).toUpperCase();
            usernameSpan.textContent = displayUsername;
        }
    };

    window.updateUIForLogout = () => {
        const userProfileDiv = document.getElementById("user-profile");
        userProfileDiv.classList.add("hidden");
        userProfileDiv.classList.remove("flex");
    };

    // Particles.js Initialization
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
                modes: {
                    grab: { distance: 140, line_opacity: 1 },
                },
            },
            retina_detect: true,
        });
    };

    const currentTheme = localStorage.getItem("theme") || "light";
    initParticles(currentTheme);

    // Re-initialize particles on theme change
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const newTheme = document
            .querySelector("html")
            .classList.contains("dark")
            ? "dark"
            : "light";
        // A short delay to allow background color transition
        setTimeout(() => initParticles(newTheme), 10);
    });
});
