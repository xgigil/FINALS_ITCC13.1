import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";

const firebaseConfig = {
apiKey: "AIzaSyBb1ihluKDBhwNnFEYNV3mDvz8jNyeJW4M",
authDomain: "create-account-63672.firebaseapp.com",
projectId: "create-account-63672",
storageBucket: "create-account-63672.firebasestorage.app",
messagingSenderId: "868874890016",
appId: "1:868874890016:web:3807b1896ad55f42b54545",
measurementId: "G-NH125X49F4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// For Login
const login = document.getElementById("login_btn");
login.addEventListener("click", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        // Check if the username exists in Firestore
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", username));    
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Username not found");
            return;
        }

        // If the username exists, proceed with Firebase Authentication
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().email;

        // Sign in with Firebase Authentication
        await signInWithEmailAndPassword(auth, userEmail, password);
        window.location.href = "game.html";
    } catch (error) {
        let errorMessage = "Login failed: ";
        switch (error.code) {
            case 'auth/wrong-password':
                errorMessage += "Invalid password";
                break;
            case 'auth/too-many-requests':
                errorMessage += "Too many failed attempts. Please try again later";
                break;
            default:
                errorMessage += error.message;
        }
        alert(errorMessage);
    }
})

// For Registration
const register = document.getElementById("register_btn");
register.addEventListener("click", async function(event){
    event.preventDefault();

    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        // Check if username already exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("Username already exists");
            return;
        }

        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            wins: 0,
            defeats: 0
        });

        // Update profile with username
        await updateProfile(user, {
            displayName: username
        });

        window.location.href = "game.html";
    } catch (error) {
        let errorMessage = "Registration failed: ";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += "Email is already registered";
                break;
            case 'auth/invalid-email':
                errorMessage += "Invalid email format";
                break;
            case 'auth/weak-password':
                errorMessage += "Password should be at least 6 characters";
                break;
            default:
                errorMessage += error.message;
        }
        alert(errorMessage);
    }
});

// For Google Sign-In
window.signInWithGoogle = async function() {
    try {
        // Configure Google Auth Provider
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // Sign in with popup
        const result = await signInWithPopup(auth, provider).catch((error) => {
            console.error("Popup error:", error);
            // Try redirect method if popup fails
            return signInWithRedirect(auth, provider);
        });

        // Get user info
        const user = result.user;
        console.log("Successfully signed in:", user.email);
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            // Store new user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                createdAt: new Date().toISOString(),
                wins: 0,
                defeats: 0
            });
        }

        window.location.href = "game.html";
    } catch (error) {
        console.error("Full auth error:", error);
        let errorMessage = "Google sign-in failed: ";
        switch (error.code) {
            case 'auth/unauthorized-domain':
                errorMessage = `This domain (${window.location.hostname}) is not authorized. Please check Firebase Console settings.`;
                break;
            case 'auth/popup-closed-by-user':
                errorMessage += "Sign-in window was closed";
                break;
            case 'auth/cancelled-popup-request':
                errorMessage += "Another sign-in attempt is in progress";
                break;
            case 'auth/popup-blocked':
                errorMessage += "Pop-up was blocked by the browser. Please allow pop-ups for this site";
                break;
            default:
                errorMessage += error.message;
        }
        alert(errorMessage);
    }
};

// Form toggle function
window.toggleForms = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display !== 'none') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
};