// Redirect to login if not signed in
if (!localStorage.getItem('loggedIn') || !localStorage.getItem('username')) {
    window.location.href = 'login.html';
}

// Define systems and subsystems
const systems = [
    {id: 1, name: "Respiratory Medicine (Pulmo)", subsystems: ["RICU", "TB and exam ward", "OP", "Casualty"]},
    {id: 2, name: "Pediatrics", subsystems: ["Wards", "PICU", "OP"]},
    {id: 3, name: "General Surgery", subsystems: ["OP", "Wards"]},
    {id: 4, name: "Radiology", subsystems: ["Morning", "Afternoon", "Night"]},
    {id: 5, name: "ENT", subsystems: ["Casualty", "Ward"]},
    {id: 6, name: "Orthopedics", subsystems: ["OP", "Ward/Casualty", "OT", "Casualty"]},
    {id: 7, name: "SPM (Community Medicine)", subsystems: ["Gudihattham", "Khurikidivagas", "Psychiatry", "CS", "DTC", "SUC", "Department"]},
    {id: 8, name: "Casualty", subsystems: [
        "CMO (8am-2pm, 2pm-8pm, 8pm-12am, 8pm-8am)",
        "COTM (medical/surgical)",
        "DSO (surgery)",
        "Pulmo (casualty/other)",
        "ENT",
        "Ophthal",
        "Psy"
    ]},
    {id: 9, name: "Medicine", subsystems: ["MICU", "COTM", "BCCO", "MMW", "FMW", "OP"]},
    {id: 10, name: "OBG & Labour Room", subsystems: [
        "Labour Room (Morning/Night)",
        "Admissions",
        "HDU",
        "Labour Room Intern",
        "POW 1",
        "POW 2",
        "PHW",
        "OP"
    ]},
    {id: 11, name: "Anaesthesia", subsystems: [
        "SS H",
        "Old Building",
        "Full Duty"
    ]}
];

// Greet user
function greetUser() {
    const username = localStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    if (user) {
        document.getElementById('greeting').innerHTML =
            `Welcome, <b>${user.fullname}</b><br>Phone: <b>${user.phone}</b>`;
    } else {
        document.getElementById('greeting').innerHTML = "";
    }
}

// Populate system select
function populateSystems() {
    const systemSelect = document.getElementById('system-select');
    systems.forEach(system => {
        const opt = document.createElement('option');
        opt.value = system.id;
        opt.textContent = system.name;
        systemSelect.appendChild(opt);
    });
}

// Populate subsystems on system select
document.addEventListener('DOMContentLoaded', function() {
    const systemSelect = document.getElementById('system-select');
    if (systemSelect) {
        systemSelect.addEventListener('change', function() {
            const systemId = this.value;
            const subsystemSelect = document.getElementById('subsystem-select');
            subsystemSelect.innerHTML = '<option value="">Select Subsystem</option>';
            if (systemId) {
                const system = systems.find(s => s.id == systemId);
                system.subsystems.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    subsystemSelect.appendChild(opt);
                });
                subsystemSelect.style.display = '';
                document.getElementById('submit-btn').style.display = '';
            } else {
                subsystemSelect.style.display = 'none';
                document.getElementById('submit-btn').style.display = 'none';
            }
        });
    }
});

// Show assignment info and leave button if already assigned
function showAssignmentInfo() {
    const username = localStorage.getItem('username');
    let assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    let assigned = false;
    let assignedSystem = '', assignedSubsystem = '', assignedSystemId = '';
    for (const sysId in assignments) {
        for (const sub in assignments[sysId]) {
            if (assignments[sysId][sub].some(u => u.username === username)) {
                assigned = true;
                assignedSystemId = sysId;
                assignedSystem = systems.find(s => s.id == sysId).name;
                assignedSubsystem = sub;
                break;
            }
        }
        if (assigned) break;
    }
    const assignmentDiv = document.getElementById('assignment-info');
    if (assigned) {
        document.getElementById('form-section').style.display = 'none';
        assignmentDiv.innerHTML = `
            <b>You are assigned to:</b><br>
            System: <b>${assignedSystem}</b><br>
            Subsystem: <b>${assignedSubsystem}</b><br>
            <button id="leave-btn">Leave</button>
        `;
        document.getElementById('leave-btn').onclick = function() {
            leaveAssignment(assignedSystemId, assignedSubsystem, username);
        };
    } else {
        document.getElementById('form-section').style.display = '';
        assignmentDiv.innerHTML = '';
    }
}

// Handle submit
function submitAssignment() {
    const systemId = document.getElementById('system-select').value;
    const subsystem = document.getElementById('subsystem-select').value;
    const msg = document.getElementById('success-message');
    msg.textContent = "";

    if (!systemId || !subsystem) {
        msg.style.color = "#c0392b";
        msg.textContent = "Please select both system and subsystem.";
        return;
    }

    const username = localStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    let assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    for (const sysId in assignments) {
        for (const sub in assignments[sysId]) {
            assignments[sysId][sub] = assignments[sysId][sub].filter(u => u.username !== username);
        }
    }
    if (!assignments[systemId]) assignments[systemId] = {};
    if (!assignments[systemId][subsystem]) assignments[systemId][subsystem] = [];

    assignments[systemId][subsystem].push({
        fullname: user.fullname,
        phone: user.phone,
        username: username
    });
    localStorage.setItem('assignments', JSON.stringify(assignments));
    msg.style.color = "#27ae60";
    msg.textContent = "Assignment successful!";
    setTimeout(() => {
        msg.textContent = "";
        showAssignmentInfo();
    }, 800);
}

// Leave assignment
function leaveAssignment(systemId, subsystem, username) {
    let assignments = JSON.parse(localStorage.getItem('assignments') || '{}');
    if (assignments[systemId] && assignments[systemId][subsystem]) {
        assignments[systemId][subsystem] = assignments[systemId][subsystem].filter(u => u.username !== username);
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }
    document.getElementById('success-message').style.color = "#c0392b";
    document.getElementById('success-message').textContent = "You have left the subsystem.";
    setTimeout(() => {
        document.getElementById('success-message').textContent = "";
        showAssignmentInfo();
    }, 1000);
}

// Logout function
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// ========== Firebase Storage File Upload ==========
// IMPORTANT: Make sure you include these scripts in your HTML before this JS file:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>

// Initialize Firebase only once
if (!window.firebase.apps?.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyDlKfGXZUjHb7NaAt3T945xUSa-9r8y0Vk",
        authDomain: "co-doctor-e0de4.firebaseapp.com",
        databaseURL: "https://co-doctor-e0de4-default-rtdb.firebaseio.com",
        projectId: "co-doctor-e0de4",
        storageBucket: "co-doctor-e0de4.appspot.com",
        messagingSenderId: "278726853369",
        appId: "1:278726853369:web:939390176e5585bc04d828",
        measurementId: "G-47XZBZ80VL"
    });
}
const storage = firebase.storage();

// File upload logic
document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.onclick = function() {
            const fileInput = document.getElementById('fileInput');
            const status = document.getElementById('uploadStatus');
            if (!fileInput.files.length) {
                status.style.color = "#e74c3c";
                status.innerText = "Please select a file.";
                return;
            }
            const file = fileInput.files[0];
            const username = localStorage.getItem('username') || 'anonymous';
            const fileRef = storage.ref('uploads/' + username + '/' + file.name);
            const uploadTask = fileRef.put(file);

            status.style.color = "#0188df";
            status.innerText = "Uploading...";

            uploadTask.on('state_changed',
                function(snapshot) {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    status.innerText = `Upload is ${progress.toFixed(1)}% done`;
                },
                function(error) {
                    status.style.color = "#e74c3c";
                    status.innerText = "Upload failed: " + error.message;
                },
                function() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        status.style.color = "#27ae60";
                        status.innerHTML = `Upload complete! <a href="${downloadURL}" target="_blank">View File</a>`;
                    });
                }
            );
        };
    }
});

// On page load
document.addEventListener('DOMContentLoaded', function() {
    greetUser();
    populateSystems();
    showAssignmentInfo();
});
