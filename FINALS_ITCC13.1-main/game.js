import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updatePassword as updateFirebasePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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
const profileBtn = document.getElementById("profile_btn");
const profilePopup = document.getElementById("profile_popup");
const closeProfileBtn = document.getElementById("closeProfile_btn");
const leaderboardBtn = document.getElementById("trophy_btn");
const leaderboardPopup = document.getElementById("leaderboard_popup");
const closeLeaderboardBtn = document.getElementById("close_leaderboard_btn");
const leaderboardList = document.getElementById('leaderboard_list');

async function updateLeaderboard() {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        
        let users = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                username: userData.username,
                wins: userData.wins || 0,
                defeats: userData.defeats || 0,
                uid: doc.id
            });
        });
        
        // Sort by wins (descending)
        users.sort((a, b) => b.wins - a.wins);

        // Clear both leaderboard list and previous rank display
        leaderboardList.innerHTML = '';
        const existingRankDisplay = document.querySelector('.current-rank');
        if (existingRankDisplay) {
            existingRankDisplay.remove();
        }

        // Add current user's rank display
        const currentUserIndex = users.findIndex(user => user.uid === currentUser.uid);
        const rankDisplay = document.createElement('div');
        rankDisplay.className = 'current-rank';
        rankDisplay.innerHTML = `
            <span>Your Rank: #${currentUserIndex + 1}</span>
            <span class="user-stats">Wins: ${users[currentUserIndex].wins} | Defeats: ${users[currentUserIndex].defeats}</span>
        `;
        document.querySelector('#leaderboard_content').insertBefore(rankDisplay, leaderboardList);
        
        // Display all users
        users.forEach((user, index) => {
            const li = document.createElement('li');
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            li.innerHTML = `
                <div class="leaderboard-entry">
                    <span class="user-info">
                        ${medal} ${user.username} 
                        <span class="stats-inline">(W: ${user.wins} | D: ${user.defeats})</span>
                    </span>
                    ${index > 2 ? `<span class="rank-number">#${index + 1}</span>` : ''}
                </div>
            `;
            if (user.uid === currentUser.uid) {
                li.classList.add('current-user');
            }
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error("Error updating leaderboard:", error);
    }
}

// Add event listeners for leaderboard
if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", () => {
        updateLeaderboard();
        leaderboardPopup.classList.remove("hidden");
    });
}

if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener("click", () => {
        leaderboardPopup.classList.add("hidden");
    });
}

// Update updateScore to refresh leaderboard
window.updateScore = async function(win) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Update scores in Firestore
        await updateDoc(userRef, {
            wins: win ? (userData.wins || 0) + 1 : userData.wins || 0,
            defeats: !win ? (userData.defeats || 0) + 1 : userData.defeats || 0
        });

        // Update local display
        if (win) {
            document.querySelector("#player_recordBox .record-win").textContent = (userData.wins || 0) + 1;
        } else {
            document.querySelector("#computer_recordBox .record-win").textContent = (userData.defeats || 0) + 1;
        }

        // Update leaderboard if it's visible
        if (!leaderboardPopup.classList.contains('hidden')) {
            await updateLeaderboard();
        }

        console.log('Score updated:', win ? 'Win' : 'Defeat');
    } catch (error) {
        console.error("Error updating score:", error);
    }
};

// Loads the user's scores when the page loads
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Get user data from Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            // Update display name
            document.querySelector('.player_score h1').textContent = `${user.displayName}:`;

            // Update scores
            window.playerScore = userData.wins || 0;
            window.computerScore = userData.defeats || 0;

            // Update score display
            document.querySelector("#player_recordBox .record-win").textContent = userData.wins || 0;
            document.querySelector("#computer_recordBox .record-win").textContent = userData.defeats || 0;

            console.log('Scores loaded:', { wins: userData.wins, defeats: userData.defeats });
        } catch (error) {
            console.error("Error loading scores:", error);
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Update score function
window.updateScore = async function(win) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Update Firestore
        await updateDoc(userRef, {
            wins: win ? (userData.wins || 0) + 1 : userData.wins || 0,
            defeats: !win ? (userData.defeats || 0) + 1 : userData.defeats || 0
        });

        // Update local display
        if (win) {
            document.querySelector("#player_recordBox .record-win").textContent = (userData.wins || 0) + 1;
        } else {
            document.querySelector("#computer_recordBox .record-win").textContent = (userData.defeats || 0) + 1;
        }

        console.log('Score updated:', win ? 'Win' : 'Defeat');
    } catch (error) {
        console.error("Error updating score:", error);
    }
};

profileBtn.addEventListener("click", () => {
    pausePopup.classList.add("hidden");
    profilePopup.classList.remove("hidden");
});

closeProfileBtn.addEventListener("click", () => {
    profilePopup.classList.add("hidden");
});

document.querySelectorAll('.profile-option-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Hide all sections
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show selected section
        const targetId = button.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }
    });
});

// Add back button functionality for sections
const addBackButtons = () => {
    document.querySelectorAll('.profile-section').forEach(section => {
        const backBtn = document.createElement('button');
        backBtn.className = 'popup_btn back-btn';
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', () => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        section.appendChild(backBtn);
    });
};

// Update username
window.updateUsername = async function() {
    const user = auth.currentUser;
    const currentUsername = document.getElementById("currentUsername").value.trim();
    const newUsername = document.getElementById("newUsername").value.trim();

    if (!newUsername) {
        alert("Please enter a new username");
        return;
    }

    if (!currentUsername || !newUsername) {
        alert("Please fill in both username fields");
        return;
    }

    try {
        // Verify current username
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData.username !== currentUsername) {
            alert("Current username is incorrect");
            return;
        }

        // Check if new username is already taken
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", newUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("Username already exists");
            return;
        }

        // Update in Firestore
        await updateDoc(userRef, {
            username: newUsername
        });

        // Update profile
        await updateProfile(user, {
            displayName: newUsername
        });

        // Update display
        document.querySelector('.player_score h1').textContent = `${newUsername}:`;
        
        alert("Username updated successfully!");
        // Clear input fields
        document.getElementById("currentUsername").value = "";
        document.getElementById("newUsername").value = "";
    } catch (error) {
        alert("Error updating username: " + error.message);
    }
};

// Update password
window.updatePassword = async function() {
    const user = auth.currentUser;
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert("Please fill in all password fields");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match");
        return;
    }

    try {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updateFirebasePassword(user, newPassword);
        
        alert("Password updated successfully!");
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";
    } catch (error) {
        alert("Error updating password: " + error.message);
    }
};

// Reset stats
window.resetStats = async function() {
    const user = auth.currentUser;
    const password = document.getElementById("resetPassword").value;

    if (!password) {
        alert("Please enter your password to reset stats");
        return;
    }

    try {
        // Verify password
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // Reset stats in Firestore
        await updateDoc(doc(db, "users", user.uid), {
            wins: 0,
            defeats: 0
        });

        // Reset local display
        window.playerScore = 0;
        window.computerScore = 0;
        document.querySelector("#player_recordBox .record-win").textContent = "0";
        document.querySelector("#computer_recordBox .record-win").textContent = "0";

        alert("Statistics have been reset!");
        document.getElementById("resetPassword").value = "";
    } catch (error) {
        alert("Error resetting stats: " + error.message);
    }
};

document.getElementById("startGame_btn").addEventListener("click", () => {
    const bgAudio = document.getElementById("bg_audio")
    bgAudio.play().catch((err) => {
        console.log("Autoplay blocked:", err)
    })
})

const audioBtn = document.getElementById("audio_btn");
const bgAudio = document.getElementById("bg_audio");

let isMuted = false;

audioBtn.addEventListener("click", () => {
    if (isMuted) {
        bgAudio.play().catch(err => console.log("Autoplay blocked:", err));
        isMuted = false;
    } else {
        bgAudio.pause();
        isMuted = true;
    }
});

document.getElementById("startGame_btn").addEventListener("click", () => {
    const bgAudio = document.getElementById("bg_audio");
    bgAudio.volume = 0.5; // Optional volume control
    bgAudio.play().catch(e => console.log("Audio play blocked:", e));
});

document.addEventListener('DOMContentLoaded', addBackButtons);