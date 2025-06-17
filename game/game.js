let currentPlayer = "X";
let gameMode = null;
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let username = "";

const loginScreen = document.getElementById("login-screen");
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const displayName = document.getElementById("display-name");
const statusText = document.getElementById("status-text");
const scoreboard = {
    player: document.getElementById("score-player"),
    opponent: document.getElementById("score-opponent")
};
const boardElement = document.getElementById("board");

let score = {
    player: 0,
    opponent: 0
};

// Anmeldung
function login() {
    const input = document.getElementById("username");
    if (input.value.trim() === "") {
        alert("Bitte gib einen Benutzernamen ein.");
        return;
    }
    username = input.value.trim();
    displayName.textContent = username;
    switchScreen(loginScreen, menuScreen);

    // Speicher Benutzername
    localStorage.setItem("username", username);
    showgamesection(username);
}

function switchScreen(from, to) {
    from.style.display = "none";
    to.style.display = "flex";
}

function startGame(mode) {
    gameMode = mode;
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    score = { player: 0, opponent: 0 };
    updateStatus();
    renderBoard();
    switchScreen(menuScreen, gameScreen);
}

function renderBoard() {
    boardElement.innerHTML = "";
    board.forEach((cell, index) => {
        const div = document.createElement("div");
        div.classList.add("board-cell");
            if (cell === "X") div.classList.add("x");
            if (cell === "O") div.classList.add("o");
        div.textContent = cell;
        div.addEventListener("click", () => handleCellClick(index));
        boardElement.appendChild(div);
    });
}

function handleCellClick(index) {
    if (!gameActive || board[index] !== "") return;

    board[index] = currentPlayer;
    renderBoard();

    if (checkWinner(currentPlayer)) {
        gameActive = false;
        statusText.textContent = `${currentPlayer === "X" ? username : "Gegner"} gewinnt!`;
        updateScore(currentPlayer);
    } else if (!board.includes("")) {
        gameActive = false;
        statusText.textContent = "Unentschieden!";
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus();
        if (gameMode.startsWith("pve") && currentPlayer === "O") {
            setTimeout(botMove, 500);
        }
    }
}

function botMove() {
    let index;
    if (gameMode === "pve-hard") {
        index = getBestMove();
    } else {
        const free = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        index = free[Math.floor(Math.random() * free.length)];
    }

    if (index !== undefined) handleCellClick(index);
}

function updateStatus() {
    statusText.textContent = `${currentPlayer === "X" ? username : "Gegner"} ist am Zug.`;
}

function checkWinner(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return winPatterns.some(pattern =>
        pattern.every(i => board[i] === player)
    );
}

function updateScore(player) {
    if (player === "X") {
        score.player++;
        scoreboard.player.textContent = score.player;
        localStorage.setItem(`score_${username}`, score.player);
    } else {
        score.opponent++;
        scoreboard.opponent.textContent = score.opponent;
        localStorage.setItem(`score_${username}_opponent`, score.opponent);
    }
}

function restartGame() {
    startGame(gameMode);
}

function backToMenu() {
    gameActive = false;
    switchScreen(gameScreen, menuScreen);
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O"; // Bot ist immer O
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

// Imposible KI
function minimax(newBoard, depth, isMaximizing) {
    if (checkWinner("O")) return 10 - depth;
    if (checkWinner("X")) return depth - 10;
    if (!newBoard.includes("")) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "O";
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";
                best = Math.max(score, best);
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "X";
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = "";
                best = Math.min(score, best);
            }
        }
        return best;
    }
}

// Auto-Login funktion, wenn der Benutzername im LocalStorage gespeichert ist.
window.onload = function() {
    username = localStorage.getItem("username");
    if (username){
        showgamesection(username);
    }
};

// Gibt Benutzername und Score aus welche gespeichert wurden
function showgamesection(name) {
    username = name;
    displayName.textContent = username;

    score.player = parseInt(localStorage.getItem(`score_${username}`)) || 0;
    score.opponent = parseInt(localStorage.getItem(`score_${username}_opponent`)) || 0;

    scoreboard.player.textContent = score.player;
    scoreboard.opponent.textContent = score.opponent;

    switchScreen(loginScreen, menuScreen);
}