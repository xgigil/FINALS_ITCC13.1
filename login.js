import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
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
const analytics = getAnalytics(app);

const login = document.getElementById("login_btn");
const register = document.getElementById("register_btn");

register.addEventListener("click", function(event){
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

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            window.location.href = "game.html";
            // ...
        })
        .catch((error) => {
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
        });
})