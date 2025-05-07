let playerScore = 0;
let computerScore = 0;
let isAnimating = false;
let playerHistory = [];

function getComputerChoice() {
    if (playerHistory.length >= 3) {
        let lastThreeMoves = playerHistory.slice(-3);
        
        if (lastThreeMoves[0] === lastThreeMoves[2]) {
            switch (lastThreeMoves[2]) {
                case 'rock': return 'paper';
                case 'paper': return 'scissors';
                case 'scissors': return 'rock';
            }
        }
    }

    if (playerHistory.length > 0) {
        let lastPlayerMove = playerHistory[playerHistory.length - 1];
        let choices = ["rock", "paper", "scissors"];
        let weights = choices.map(choice => {
            if ((lastPlayerMove === "rock" && choice === "paper") ||
                (lastPlayerMove === "paper" && choice === "scissors") ||
                (lastPlayerMove === "scissors" && choice === "rock")) {
                return 0.5;
            }
            return 0.25;
        });
        
        let total = weights.reduce((a, b) => a + b);
        let random = Math.random() * total;
        let sum = 0;
        
        for (let i = 0; i < choices.length; i++) {
            sum += weights[i];
            if (random <= sum) return choices[i];
        }
    }

    const choices = ["rock", "paper", "scissors"];
    return choices[Math.floor(Math.random() * choices.length)];
}

function playGame(playerChoice) {
    if (isAnimating) return;
    isAnimating = true;

    playerHistory.push(playerChoice);
    
    const computerChoice = getComputerChoice();

    const playerChoiceElement = document.querySelector(".player_choice img");
    const computerChoiceElement = document.querySelector(".computer_choice img");

    playerChoiceElement.src = "images/rock.png";
    computerChoiceElement.src = "images/rock.png";

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
            } else if (
                (playerChoice === "rock" && computerChoice === "scissors") ||
                (playerChoice === "paper" && computerChoice === "rock") ||
                (playerChoice === "scissors" && computerChoice === "paper")
            ) {
                playerScore++;
            } else {
                computerScore++;
            }

            document.querySelector("#player_recordBox .record-win").textContent = playerScore;
            document.querySelector("#computer_recordBox .record-win").textContent = computerScore;
            
            isAnimating = false;
        }
    }, 300);
}

document.querySelectorAll(".options_icon").forEach(img => {
    img.style.transition = "transform 0.2s ease";
});