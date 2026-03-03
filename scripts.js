/*!
* Start Bootstrap - Personal v1.0.1
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT
*/

document.addEventListener("DOMContentLoaded", () => {
    /* --- 1. DAILY RESET LOGIC (Run this first!) --- */
    handleDailyReset();

    /* --- 2. THEME & DARK MODE LOGIC --- */
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedColor = localStorage.getItem("themeColor");
    document.body.setAttribute("data-theme", savedTheme);

    if (savedColor) {
        applyThemeColor(savedColor);
    }

    const themeCheckbox = document.querySelector(".checkbox");
    if (themeCheckbox) {
        themeCheckbox.checked = (savedTheme === "dark");
        themeCheckbox.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? "dark" : "light";
            document.body.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    /* --- 3. USERNAME & DISPLAY LOGIC --- */
    const savedUser = localStorage.getItem("username") || "Guest";
    const navDisplay = document.getElementById('nav-username');
    const dropdownDisplay = document.getElementById("usernameDisplay");
    const settingsInput = document.getElementById("newUsername");

    if (navDisplay) navDisplay.textContent = savedUser;
    if (dropdownDisplay) dropdownDisplay.textContent = savedUser;
    if (settingsInput) settingsInput.value = savedUser;

    /* --- 4. SETTINGS & LOGOUT LOGIC --- */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            alert("Logging out...");
            window.location.href = "login.html";
        });
    }

    const saveUsernameBtn = document.getElementById("saveUsername");
    if (saveUsernameBtn && settingsInput) {
        saveUsernameBtn.addEventListener("click", () => {
            const newName = settingsInput.value.trim();
            if (newName) {
                localStorage.setItem("username", newName);
                if (navDisplay) navDisplay.textContent = newName;
                if (dropdownDisplay) dropdownDisplay.textContent = newName;
                alert("Username updated successfully!");
            }
        });
    }

    const clearDataBtn = document.getElementById("clearData");
    if (clearDataBtn) {
        clearDataBtn.addEventListener("click", () => {
            if (confirm("Are you sure? This will delete all your progress and habits!")) {
                localStorage.clear();
                alert("All data cleared.");
                window.location.href = "index.html";
            }
        });
    }

    /* --- 5. INITIALIZE TODO LIST --- */
    if (typeof render === "function") {
        render();
    }
});

/* --- HELPER FUNCTIONS --- */

function handleDailyReset() {
    const today = new Date().toLocaleDateString();
    const lastResetDate = localStorage.getItem('lastResetDate');

    // If it's the very first time using the app
    if (!lastResetDate) {
        localStorage.setItem('lastResetDate', today);
        return;
    }

    if (lastResetDate !== today) {
        const tasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];
        
        // Archive progress if there are tasks
        if (tasks.length > 0) {
            const completed = tasks.filter(t => t.done).length;
            const percentage = Math.round((completed / tasks.length) * 100);

            let history = JSON.parse(localStorage.getItem('progressHistory')) || [];
            history.push({
                date: lastResetDate, // Save it as the date the tasks were actually done
                percent: percentage
            });
            localStorage.setItem('progressHistory', JSON.stringify(history));
        }

        // Reset tasks to 'not done'
        const resetTasks = tasks.map(t => ({ ...t, done: false }));
        localStorage.setItem('dailyTasks', JSON.stringify(resetTasks));
        localStorage.setItem('lastResetDate', today);
    }
}

function applyThemeColor(colorCode) {
    document.querySelectorAll('.text-gradient').forEach(el => {
        el.style.backgroundImage = `linear-gradient(45deg, ${colorCode}, #6610f2)`;
    });
}

function setTheme(colorCode) {
    localStorage.setItem("themeColor", colorCode);
    applyThemeColor(colorCode);
    alert("Theme color saved!");
}

// Menu and Sticky Note functions remain the same as your previous version
function createNote() {
    const stickyNotes = document.querySelector('.sticky-notes');
    if (!stickyNotes) return;
    const noteContainer = document.createElement('div');
    noteContainer.classList.add('note-container');
    const noteContent = document.createElement('div');
    noteContent.classList.add('note-content');
    noteContent.contentEditable = true;
    noteContent.textContent = 'New note';
    const noteActions = document.createElement('div');
    noteActions.classList.add('note-actions');
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-note');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => noteContainer.remove();
    noteActions.appendChild(deleteButton);
    noteContainer.appendChild(noteContent);
    noteContainer.appendChild(noteActions);
    stickyNotes.appendChild(noteContainer);
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
if (menuToggle && navigation) {
    menuToggle.onclick = () => navigation.classList.toggle('open');
}

const listItems = document.querySelectorAll('.list-item');
listItems.forEach(item => {
    item.onclick = () => {
        listItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }
});

