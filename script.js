let currentModeMinutes = 25;
let timerSeconds = 25 * 60;
let isRunning = false;
let timerInterval = null;
let isDark = false;
let completedSessions = 0;

let tasks = JSON.parse(localStorage.getItem('eduhub_tasks')) || [
    { id: 1, text: "Focus Study for DSA (Loops & Logic)", completed: false }
];

window.onload = () => {
    renderTasks();
    updateDisplay();
    // Load saved notes
    const savedNotes = localStorage.getItem('eduhub_notes');
    if (savedNotes) {
        document.getElementById('quick-notes').value = savedNotes;
    }
};

function updateDisplay() {
    const min = Math.floor(timerSeconds / 60);
    const sec = timerSeconds % 60;
    document.getElementById('timer-display').textContent = 
        `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function setMode(minutes, btnElement) {
    clearInterval(timerInterval);
    isRunning = false;
    currentModeMinutes = minutes;
    timerSeconds = minutes * 60;
    
    document.getElementById('play-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
    document.getElementById('timer-status').textContent = "Ready to start";
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active-mode', 'dark-mode-btn');
    });
    btnElement.classList.add(isDark ? 'dark-mode-btn' : 'active-mode');
    
    updateDisplay();
}

function toggleTimer() {
    const btn = document.getElementById('play-btn');
    const status = document.getElementById('timer-status');
    
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        status.textContent = "Paused";
    } else {
        isRunning = true;
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        status.textContent = currentModeMinutes === 25 ? "Focusing..." : "On Break...";
        
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                status.textContent = "Completed!";
                playNotificationSound();
                
                if (currentModeMinutes === 25) {
                    completedSessions++;
                    document.getElementById('session-count').textContent = `${completedSessions} Sessions`;
                }
                alert("Time's up! Great job!");
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerSeconds = currentModeMinutes * 60;
    document.getElementById('play-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
    document.getElementById('timer-status').textContent = "Ready to start";
    updateDisplay();
}

function toggleTheme() {
    isDark = !isDark;
    const card = document.getElementById('app-card');
    const ring = document.getElementById('timer-ring');
    const display = document.getElementById('timer-display');
    const heading = document.getElementById('tasks-heading');
    const notesHeading = document.getElementById('notes-heading');
    const themeBtn = document.getElementById('theme-btn');
    const playBtn = document.getElementById('play-btn');

    document.body.classList.toggle('dark-body');

    if (isDark) {
        card.classList.add('app-card-dark');
        ring.classList.add('timer-circle-dark');
        display.style.color = '#FFFFFF';
        heading.style.color = '#CBD5E1';
        notesHeading.style.color = '#CBD5E1';
        themeBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #FACC15;"></i>';
        themeBtn.style.background = '#1E293B';
        playBtn.style.background = '#FACC15';
        playBtn.style.color = '#0F172A';
        
        const activeBtn = document.querySelector('.active-mode');
        if (activeBtn) {
            activeBtn.classList.remove('active-mode');
            activeBtn.classList.add('dark-mode-btn');
        }
    } else {
        card.classList.remove('app-card-dark');
        ring.classList.remove('timer-circle-dark');
        display.style.color = 'var(--text-main)';
        heading.style.color = '#475569';
        notesHeading.style.color = '#475569';
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        themeBtn.style.background = '#F1F5F9';
        playBtn.style.background = 'var(--primary-dark)';
        playBtn.style.color = '#FFFFFF';

        const darkActiveBtn = document.querySelector('.dark-mode-btn');
        if (darkActiveBtn) {
            darkActiveBtn.classList.remove('dark-mode-btn');
            darkActiveBtn.classList.add('active-mode');
        }
    }
}

function saveTasks() {
    localStorage.setItem('eduhub_tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const ul = document.getElementById('task-list');
    ul.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        li.innerHTML = `
            <div class="task-content-left" onclick="toggleTaskComplete(${task.id})">
                <i class="fa-${task.completed ? 'solid fa-circle-check' : 'regular fa-circle'}" style="color: ${task.completed ? '#10B981' : '#94A3B8'};"></i>
                <span class="${task.completed ? 'completed-text' : ''}">${task.text}</span>
            </div>
            <div class="task-actions">
                <button onclick="setFocusTask('${task.text}')" class="focus-btn">Focus</button>
                <i onclick="deleteTask(${task.id})" class="fa-solid fa-xmark delete-btn"></i>
            </div>
        `;
        ul.appendChild(li);
    });
}

function addTask() {
    const taskName = prompt("What would you like to study or complete?");
    if (taskName && taskName.trim() !== "") {
        tasks.push({
            id: Date.now(),
            text: taskName.trim(),
            completed: false
        });
        saveTasks();
        renderTasks();
    }
}

function toggleTaskComplete(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function setFocusTask(title) {
    document.getElementById('active-task-title').textContent = title;
}

function saveNotes() {
    const notesText = document.getElementById('quick-notes').value;
    localStorage.setItem('eduhub_notes', notesText);
}

function playNotificationSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
}