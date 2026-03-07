
    const currentUser = localStorage.getItem("username");

    /**
     * 1. DAILY PROGRESS (Firestore)
     * Fetches tasks from the "dailyTasks" collection filtered by the current user
     */
    async function updateProgress() {
        try {
            const snapshot = await db.collection("dailyTasks")
                                    .where("owner", "==", currentUser)
                                    .get();
            
            let total = snapshot.size;
            let completed = 0;

            snapshot.forEach(doc => {
                if (doc.data().done === true) completed++;
            });

            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            // Update UI
            document.getElementById('percentText').textContent = percentage;
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('remainingTasks').textContent = total - completed;

            const progressBar = document.getElementById('mainProgressBar');
            if (progressBar) progressBar.style.width = percentage + "%";
            
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    }

    /**
     * 2. HISTORY LOGIC (Firestore)
     * Fetches archived progress from a "progressHistory" collection
     */
    async function displayHistory() {
        const historyContainer = document.getElementById('historyList');
        
        try {
            const snapshot = await db.collection("progressHistory")
                                    .where("owner", "==", currentUser)
                                    .orderBy("date", "desc")
                                    .limit(7)
                                    .get();

            if (snapshot.empty) {
                historyContainer.innerHTML = '<div class="text-center py-3 text-muted small">No history found in the cloud.</div>';
                return;
            }

            let html = "";
            snapshot.forEach(doc => {
                const entry = doc.data();
                html += `
                    <div class="list-group-item bg-transparent px-0 border-0 mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="small fw-bold text-secondary">
                                <span class="text-primary">Day</span>, ${entry.date}
                            </span>
                            <span class="small fw-bold">${entry.percent}%</span>
                        </div>
                        <div class="progress history-bar-container" style="height: 10px;">
                            <div class="progress-bar" style="width: ${entry.percent}%;"></div>
                        </div>
                    </div>`;
            });
            historyContainer.innerHTML = html;

        } catch (error) {
            console.error("History fetch error:", error);
            historyContainer.innerHTML = '<div class="text-center py-3 text-danger small">Error loading history.</div>';
        }
    }

    /**
     * 3. MONTHLY CHART (Firestore)
     * Stays as you had it, but with added error handling
     */
    async function renderMonthlyChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');

        try {
            const snapshot = await db.collection("monthlyTasks")
                                    .where("owner", "==", currentUser)
                                    .get();

            const labels = [];
            const dataValues = [];

            snapshot.forEach(doc => {
                const task = doc.data();
                labels.push(task.name);
                const doneCount = task.days ? task.days.filter(d => d === true).length : 0;
                dataValues.push(doneCount);
            });

            if (window.myProgressChart) { window.myProgressChart.destroy(); }

            window.myProgressChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Days Completed',
                        data: dataValues,
                        backgroundColor: 'rgba(74, 144, 226, 0.6)',
                        borderColor: '#4a90e2',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { beginAtZero: true, max: 31 },
                        y: { grid: { display: false } }
                    }
                }
            });
        } catch (error) {
            console.error("Chart render error:", error);
        }
    }

    // Init on Load
    document.addEventListener('DOMContentLoaded', () => {
        updateProgress();
        displayHistory();
        renderMonthlyChart();
    });








    const hiveThemes = {
    '#6366f1': { // INDIGO HIVE
        primary: '#6366f1', 
        secondary: '#a855f7', 
        soft: 'rgba(99, 102, 241, 0.1)' 
    },
    '#ec4899': { // PINK HIVE (The one you mentioned!)
        primary: '#ec4899', 
        secondary: '#fb7185', // A soft rose-red for a beautiful gradient
        soft: 'rgba(236, 72, 153, 0.1)' 
    },
    '#10b981': { // EMERALD HIVE
        primary: '#10b981', 
        secondary: '#3b82f6', // Fades into a deep sea blue
        soft: 'rgba(16, 185, 129, 0.1)' 
    },
    '#f59e0b': { // AMBER HIVE
        primary: '#f59e0b', 
        secondary: '#ef4444', // Fades into a sunset red
        soft: 'rgba(245, 158, 11, 0.1)' 
    },
    '#3b82f6': { // SKY HIVE
        primary: '#3b82f6', 
        secondary: '#2dd4bf', // Fades into a bright teal
        soft: 'rgba(59, 130, 246, 0.1)' 
    }
};

function applyTheme(colorHex) {
    const theme = hiveThemes[colorHex] || hiveThemes['#6366f1'];
    const root = document.documentElement;
    
    // This updates the CSS Variables in real-time!
    root.style.setProperty('--hive-primary', theme.primary);
    root.style.setProperty('--hive-secondary', theme.secondary);
    root.style.setProperty('--hive-soft', theme.soft);
}

// When the page loads, fetch the saved color and apply the full palette
db.collection("userSettings").doc(currentUser).get().then(doc => {
    if (doc.exists && doc.data().themeColor) {
        applyTheme(doc.data().themeColor);
    }
});