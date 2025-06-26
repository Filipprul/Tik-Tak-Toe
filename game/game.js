let currentPlayer = "X";
let gameMode = null;
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let username = "";
let email = "";
let password = "";

const loginScreen = document.getElementById("login-screen");
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const displayName = document.getElementById("display-name");
const statusText = document.getElementById("status-text");
const scoreboard = {
    player: document.getElementById("score-player"),
    opponent: document.getElementById("score-opponent")
};
const scoretable = {
    win: document.getElementById("score-win"),
    lose: document.getElementById("score-lose"),
    wl: document.getElementById("score-wl")
}
const boardElement = document.getElementById("board");

let score = {
    player: 0,
    opponent: 0
};

let stats = {
    wins: 0,
    losses: 0,
    wl: 0
}

// Anmeldung
function login() {
    const user = document.getElementById("username");
    const mail = document.getElementById("email");
    const pass = document.getElementById("password");
    
    if (
        user.value.trim() === "" ||
        mail.value.trim() === "" ||
        pass.value.trim() === ""
    ) {
        alert("Bitte füllen Sie alle Felder aus.");
        return;
    }

    username = user.value.trim();
    email = mail.value.trim();
    password = pass.value.trim();
    displayName.textContent = username;
    switchScreen(loginScreen, menuScreen);

    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
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

// Aktualisiert den Score für den Spieler oder Gegner.
function updateScore(player) {
    if (player === "X") {
        score.player++;
        stats.wins++;
        scoretable.win.textContent = stats.wins;
        scoreboard.player.textContent = score.player;
        localStorage.setItem(`stats_${email}_wins`, stats.wins);
        localStorage.setItem(`score_${email}_player`, score.player);
    } else {
        stats.losses++;
        score.opponent++;
         scoretable.lose.textContent = stats.losses;
        scoreboard.opponent.textContent = score.opponent;
        localStorage.setItem(`stats_${email}_losses`, stats.losses);
        localStorage.setItem(`score_${email}_opponent`, score.opponent);
    }

    if (stats.losses === 0 && stats.wins > 0) {
        stats.wl = stats.wins;
        scoretable.wl.textContent = stats.wl;
        localStorage.setItem(`stats_${email}_wl`, stats.wl);
    } else if (stats.losses > 0) {
        stats.wl = (stats.wins / stats.losses).toFixed(2);
        scoretable.wl.textContent = stats.wl;
        localStorage.setItem(`stats_${email}_wl`, stats.wl);
    }
}

// Spiel wiederholen.
function restartGame() {
    startGame(gameMode);
}

// Zurück zum Menü
function backToMenu() {
    gameActive = false;
    switchScreen(gameScreen, menuScreen);
}

// Funktion, um den besten Zug für den Bot zu finden (Minimax-Algorithmus).
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

// Imposible KI (Bitte keine Fragen stellen, wie das funktioniert, da ich es nicht weiß wie es funktioniert, aber es funktioniert)
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
    email = localStorage.getItem("email");
    password = localStorage.getItem("password");
    if (username && email && password) {
        showgamesection(username);
    }
};

// Zeigt den Spielabschnitt an und aktualisiert den Score
function showgamesection(name) {
    username = name;
    displayName.textContent = username;

    score.player = parseInt(localStorage.getItem(`score_${email}_player`)) || 0;
    score.opponent = parseInt(localStorage.getItem(`score_${email}_opponent`)) || 0;

    scoreboard.player.textContent = score.player;
    scoreboard.opponent.textContent = score.opponent;

    switchScreen(loginScreen, menuScreen);
}

// Logout Funktion
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    username = "";
    email = "";
    password = "";
    switchScreen(menuScreen, loginScreen);
    document.getElementById("username").value = ""; 
    document.getElementById("email").value = ""; 
    document.getElementById("password").value = ""; 
};

// Zurücksetzen des Scores und Statistiken 
function resetScore() {
    score.player = 0;
    score.opponent = 0;
    stats.wins = 0;
    stats.losses = 0;
    stats.wl = 0;
    localStorage.removeItem(`stats_${email}_wins`);
    localStorage.removeItem(`stats_${email}_losses`);
    localStorage.removeItem(`stats_${email}_wl`);
    localStorage.removeItem(`score_${email}_player`);
    localStorage.removeItem(`score_${email}_opponent`);
    scoreboard.player.textContent = "0";
    scoreboard.opponent.textContent = "0";
    scoretable.wins.textContent = "0";
    scoretable.losses.textContent = "0";
    scoretable.wl.textContent = "0";
};