const rulesPopup = document.getElementById("rules_popup")
const startGameBtn = document.getElementById("startGame_btn")
const rulesBtn = document.getElementById("rules_btn")

window.addEventListener("load", () => {
    document.body.classList.add("loaded")
    rulesPopup.classList.remove("hidden")
})

const pauseBtn = document.getElementById("pause_btn")
const pausePopup = document.getElementById("pause_popup")
const resumeBtn = document.getElementById("resume_btn")

const popup = document.getElementById('confirmation_popup')
const confirmationText = document.querySelector('#confirmation_content h2')

const leaderboardBtn = document.getElementById("trophy_btn")
const leaderboardPopup = document.getElementById("leaderboard_popup")
const closeLeaderboardBtn = document.getElementById("close_leaderboard_btn")

window.playerHistory = [];
window.playerScore = 0;
window.computerScore = 0;
window.isAnimating = false;
let currentAction = ''

function getComputerChoice() {
    if (playerHistory.length >= 3) {
        let lastThreeMoves = playerHistory.slice(-3)
        
        if (lastThreeMoves[0] === lastThreeMoves[2]) {
            switch (lastThreeMoves[2]) {
                case 'rock': return 'paper'
                case 'paper': return 'scissors'
                case 'scissors': return 'rock'
            }
        }
    }

    if (playerHistory.length > 0) {
        let lastPlayerMove = playerHistory[playerHistory.length - 1]
        let choices = ["rock", "paper", "scissors"]
        let weights = choices.map(choice => {
            if ((lastPlayerMove === "rock" && choice === "paper") ||
                (lastPlayerMove === "paper" && choice === "scissors") ||
                (lastPlayerMove === "scissors" && choice === "rock")) {
                return 0.5
            }
            return 0.25
        })
        
        let total = weights.reduce((a, b) => a + b)
        let random = Math.random() * total
        let sum = 0
        
        for (let i = 0; i < choices.length; i++) {
            sum += weights[i]
            if (random <= sum) return choices[i]
        }
    }

    const choices = ["rock", "paper", "scissors"]
    return choices[Math.floor(Math.random() * choices.length)]
}

window.playGame = async function(playerChoice) {
    if (window.isAnimating) return;
    window.isAnimating = true;

    const playerChoiceElement = document.querySelector(".player_choice img");
    const computerChoiceElement = document.querySelector(".computer_choice img");
    
    playerChoiceElement.src = "images/rock.png";
    computerChoiceElement.src = "images/rock.png";

    window.playerHistory.push(playerChoice);
    const computerChoice = getComputerChoice();

    let count = 0;
    const shakeInterval = setInterval(() => {
        if (count % 2 === 0) {
            playerChoiceElement.style.transform = "translateY(-20px)";
            computerChoiceElement.style.transform = "translateY(-20px)";
        } else {
            playerChoiceElement.style.transform = "translateY(0px)";
            computerChoiceElement.style.transform = "translateY(0px)";
        }
        count++;

        if (count > 6) {
            clearInterval(shakeInterval);
            
            playerChoiceElement.src = `images/${playerChoice}.png`;
            computerChoiceElement.src = `images/${computerChoice}.png`;

            playerChoiceElement.style.transform = "translateY(0px)";
            computerChoiceElement.style.transform = "translateY(0px)";

            if (playerChoice === computerChoice) {
                // Draw - no score update
            } else if (
                (playerChoice === "rock" && computerChoice === "scissors") ||
                (playerChoice === "paper" && computerChoice === "rock") ||
                (playerChoice === "scissors" && computerChoice === "paper")
            ) {
                window.playerScore++;
                if (window.updateScore) {
                    window.updateScore(true);
                }
            } else {
                window.computerScore++;
                if (window.updateScore) {
                    window.updateScore(false);
                }
            }

            document.querySelector("#player_recordBox .record-win").textContent = window.playerScore;
            document.querySelector("#computer_recordBox .record-win").textContent = window.computerScore;
            
            window.isAnimating = false;
        }
    }, 300);
};

function showConfirmationPopup(action) {
    currentAction = action
    
    if (action === 'quit') {
        confirmationText.textContent = 'Exit the game?'
    }
    popup.classList.remove('hidden')
}

function handleConfirm() {
    if (currentAction === 'quit') {
        window.location.href = 'index.html'
    }
    document.getElementById('confirmation_popup').classList.add('hidden')
}

function handleCancel() {
    document.getElementById('confirmation_popup').classList.add('hidden')
}

document.querySelectorAll(".options_icon").forEach(img => {
    img.style.transition = "transform 0.2s ease"
})

// Rules Pop-up
startGameBtn.addEventListener("click", () => {
    rulesPopup.classList.add("hidden")
})

rulesBtn.addEventListener("click", () => {
    pausePopup.classList.add("hidden")
    rulesPopup.classList.remove("hidden")
})

// Pause Pop-up
pauseBtn.addEventListener("click", () => {
    pausePopup.classList.remove("hidden")
})

resumeBtn.addEventListener("click", () => {
    pausePopup.classList.add("hidden")
})

// Leaderboard
leaderboardBtn.addEventListener("click", () => {
    leaderboardPopup.classList.remove("hidden")
})

closeLeaderboardBtn.addEventListener("click", () => {
    leaderboardPopup.classList.add("hidden")
})

// Confirmation
document.getElementById('quit_btn').addEventListener('click', () => {
    pausePopup.classList.add("hidden")
    showConfirmationPopup('quit')
})