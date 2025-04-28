
import { db, auth } from "./firebase.js";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// ----------- User Registration -----------
async function register() {
    const fullname = document.getElementById('reg-fullname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errorElem = document.getElementById('register-error');

    if (!fullname || !phone || !username || !password) {
        errorElem.style.color = "red";
        errorElem.innerText = "Please fill in all fields.";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, username + "@codoctor.com", password);
        await setDoc(doc(db, "users", username), {
            fullname: fullname,
            phone: phone
        });
        errorElem.style.color = "green";
        errorElem.innerText = "Registration successful! Redirecting to login...";
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    } catch (error) {
        errorElem.style.color = "red";
        errorElem.innerText = error.message;
    }
}

// ----------- User Login -----------
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorElem = document.getElementById('login-error');

    try {
        await signInWithEmailAndPassword(auth, username + "@codoctor.com", password);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        window.location.href = 'form.html';
    } catch (error) {
        errorElem.style.color = "red";
        errorElem.innerText = "Invalid credentials!";
    }
}

// ----------- Logout -----------
function logout() {
    signOut(auth).then(() => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error(error);
    });
}

// ----------- Assignment Functions -----------
async function submitAssignment() {
    const systemId = document.getElementById('system-select').value;
    const subsystem = document.getElementById('subsystem-select').value;
    const msg = document.getElementById('success-message');

    msg.textContent = "";

    if (!systemId || !subsystem) {
        msg.style.color = "#c0392b";
        msg.innerText = "Please select both system and subsystem!";
        return;
    }

    const username = localStorage.getItem('username');
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
        msg.style.color = "#c0392b";
        msg.innerText = "User not found!";
        return;
    }

    const userData = userDoc.data();
    const assignmentKey = `${systemId}_${subsystem}`;

    await setDoc(doc(db, "assignments", assignmentKey), {
        assignedUsers: arrayUnion({
            fullname: userData.fullname,
            phone: userData.phone,
            username: username
        })
    }, { merge: true });

    msg.style.color = "#27ae60";
    msg.innerText = "Assignment successful!";
    setTimeout(() => {
        msg.innerText = "";
        showAssignmentInfo();
    }, 700);
}

async function leaveAssignment(systemId, subsystem, username) {
    const assignmentKey = `${systemId}_${subsystem}`;
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) return;
    const userData = userDoc.data();

    await updateDoc(doc(db, "assignments", assignmentKey), {
        assignedUsers: arrayRemove({
            fullname: userData.fullname,
            phone: userData.phone,
            username: username
        })
    });

    const msg = document.getElementById('success-message');
    msg.style.color = "#c0392b";
    msg.innerText = "You have left the subsystem.";
    setTimeout(() => {
        msg.innerText = "";
        showAssignmentInfo();
    }, 1000);
}

async function showAssignmentInfo() {
    const username = localStorage.getItem('username');
    const assignmentDiv = document.getElementById('assignment-info');
    let assigned = false;
    let assignedSystem = '', assignedSubsystem = '', assignedSystemId = '';

    const systemsArray = typeof systems !== "undefined" ? systems : [];
    for (const system of systemsArray) {
        for (const sub of system.subsystems) {
            const assignmentKey = `${system.id}_${sub}`;
            const assignmentDoc = await getDoc(doc(db, "assignments", assignmentKey));
            if (assignmentDoc.exists()) {
                const users = assignmentDoc.data().assignedUsers || [];
                if (users.some(u => u.username === username)) {
                    assigned = true;
                    assignedSystemId = system.id;
                    assignedSystem = system.name;
                    assignedSubsystem = sub;
                    break;
                }
            }
        }
        if (assigned) break;
    }

    if (assigned) {
        if (document.getElementById('form-section')) document.getElementById('form-section').style.display = 'none';
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
        if (document.getElementById('form-section')) document.getElementById('form-section').style.display = '';
        assignmentDiv.innerHTML = '';
    }
}

// ----------- Home Page Credential Display -----------
async function loadHome() {
    const loggedIn = localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username');
    if (!loggedIn || !username) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
        window.location.href = 'login.html';
        return;
    }
    const user = userDoc.data();
    if (document.getElementById('doctor-credentials')) {
        document.getElementById('doctor-credentials').innerText =
            `Logged in as: Dr. ${user.fullname} | Phone: ${user.phone}`;
    }
}

// ----------- Greeting on Form Page -----------
async function greetUser() {
    const username = localStorage.getItem('username');
    const userDoc = await getDoc(doc(db, "users", username));
    if (userDoc.exists() && document.getElementById('greeting')) {
        const user = userDoc.data();
        document.getElementById('greeting').innerHTML =
            `Welcome, <b>${user.fullname}</b><br>Phone: <b>${user.phone}</b>`;
    }
}

// ----------- Page Initialization -----------
if (document.getElementById('doctor-credentials')) {
    loadHome();
}
