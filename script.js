// ----------- Firebase Authentication and Firestore Functions -----------

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
  if (!/^\d{10}$/.test(phone)) {
    errorElem.style.color = "red";
    errorElem.innerText = "Please enter a valid 10-digit phone number.";
    return;
  }

  try {
    // Create email-like format from username for Firebase Auth
    const email = `${username}@co-doctor.com`;
    
    // Create user with Firebase Authentication
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    
    // Store additional user data in Firestore
    await firebase.firestore().collection("users").doc(userCredential.user.uid).set({
      fullname,
      phone,
      username
    });
    
    errorElem.style.color = "green";
    errorElem.innerText = "Registration successful! Redirecting to login...";
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  } catch (error) {
    errorElem.style.color = "red";
    if (error.code === "auth/email-already-in-use") {
      errorElem.innerText = "Username already exists. Please choose another.";
    } else {
      errorElem.innerText = error.message;
    }
  }
}

// ----------- User Login -----------
async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorElem = document.getElementById('login-error');

  try {
    const email = `${username}@co-doctor.com`;
    
    // Sign in with Firebase Authentication
    await firebase.auth().signInWithEmailAndPassword(email, password);
    
    // Store minimal info in session storage for quick access
    const userSnapshot = await firebase.firestore()
      .collection("users")
      .where("username", "==", username)
      .get();
      
    if (!userSnapshot.empty) {
      sessionStorage.setItem('userProfile', JSON.stringify(userSnapshot.docs[0].data()));
    }
    
    window.location.href = 'form.html';
  } catch (error) {
    errorElem.style.color = "red";
    errorElem.innerText = "Invalid credentials!";
  }
}

// ----------- Logout -----------
function logout() {
  firebase.auth().signOut().then(() => {
    sessionStorage.removeItem('userProfile');
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error("Error signing out:", error);
  });
}

// ----------- Assignment Functions -----------

// Assign user to system/subsystem
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

  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      msg.style.color = "#c0392b";
      msg.innerText = "You must be logged in to make assignments.";
      return;
    }

    const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
    if (!userProfile) {
      msg.style.color = "#c0392b";
      msg.innerText = "Session expired. Please log in again.";
      return;
    }

    const db = firebase.firestore();
    const assignmentsRef = db.collection("assignments");
    const existingAssignments = await assignmentsRef.get();

    // Remove user from all previous assignments
    for (const doc of existingAssignments.docs) {
      const data = doc.data();
      if (data.users && Array.isArray(data.users)) {
        const userIndex = data.users.findIndex(u => u.username === userProfile.username);
        if (userIndex >= 0) {
          await assignmentsRef.doc(doc.id).update({
            users: firebase.firestore.FieldValue.arrayRemove(getUserObject(userProfile))
          });
        }
      }
    }

    // Add user to the new assignment
    const assignmentDocId = `${systemId}_${subsystem}`;
    await assignmentsRef.doc(assignmentDocId).set({
      users: firebase.firestore.FieldValue.arrayUnion(getUserObject(userProfile))
    }, { merge: true });

    msg.style.color = "#27ae60";
    msg.innerText = "Assignment successful!";
    setTimeout(() => {
      msg.innerText = "";
      showAssignmentInfo();
    }, 700);

  } catch (error) {
    msg.style.color = "#c0392b";
    msg.innerText = "Error assigning: " + error.message;
    console.error("Assignment error:", error);
  }
}

// Remove user from their assignment
async function leaveAssignment(systemId, subsystem, username) {
  try {
    const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
    const db = firebase.firestore();
    await db.collection("assignments").doc(`${systemId}_${subsystem}`).update({
      users: firebase.firestore.FieldValue.arrayRemove(getUserObject(userProfile))
    });

    const msg = document.getElementById('success-message');
    msg.style.color = "#c0392b";
    msg.innerText = "You have left the subsystem.";
    setTimeout(() => {
      msg.innerText = "";
      showAssignmentInfo();
    }, 1000);

  } catch (error) {
    console.error("Error leaving assignment:", error);
  }
}




// ----------- Page Initialization -----------
function initFormPage() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    greetUser();
    if (typeof populateSystems === "function") populateSystems();
    showAssignmentInfo();
  });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase if it hasn't been initialized yet
  if (!firebase.apps.length) {
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
  
  // Check which page we're on
  const path = window.location.pathname;
  if (path.includes('form.html')) {
    initFormPage();
  }
});
