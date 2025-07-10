// Startspieler ist "X".
let currentPlayer = "X";
// null bedeutet: Es wurde noch kein Spielmodus ausgewählt.
let gameMode = null;
// Das Spielbrett als Array mit 9 Feldern.
let board = ["", "", "", "", "", "", "", "", ""];
// Wird auf true gesetzt, wenn ein Spiel gestartet wurde.
let gameActive = false;
// Variablen für den Benutzernamen, E-Mail und Passwort.
let username = "";
let email = "";
let password = "";

// DOM-Elemente für die verschiedenen Bildschirme und Statusanzeigen.
const loginScreen = document.getElementById("login-screen");
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
// DOM-Elemente für die Anzeige des Benutzernamens und des Status.
const displayName = document.getElementById("display-name");
const statusText = document.getElementById("status-text");
// DOM-Elemente, die die Spielpunkte von Spieler und Gegner anzeigen.
const scoreboard = {
    player: document.getElementById("score-player"),
    opponent: document.getElementById("score-opponent")
};
// DOM-Elemente für die Anzeige der Statistiken.
const scoretable = {
    win: document.getElementById("score-win"),
    lose: document.getElementById("score-lose"),
    wl: document.getElementById("score-wl")
}
// Dieses Element stellt das tatsächliche Tic-Tac-Toe-Brett in der HTML-Oberfläche dar.
const boardElement = document.getElementById("board");

// Initialisiert den Score.
let score = {
    player: 0,
    opponent: 0
};

// Initialisiert die Statistiken.
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

// Diese Funktion wechselt zwischen den verschiedenen Bildschirmen der Anwendung.
function switchScreen(from, to) {
    from.style.display = "none";
    to.style.display = "flex";
}

// Diese Funktion startet ein neues Spiel mit dem ausgewählten Spielmodus.
function startGame(mode) {
    gameMode = mode;
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    updateStatus();
    renderBoard();
    switchScreen(menuScreen, gameScreen);
}

// Macht das Board.
function renderBoard() {

    // Leert das Board-Element.
    boardElement.innerHTML = "";

    //Die Funktion geht jedes Feld im board-Array (also 9 Felder) der Reihe nach durch.
    board.forEach((cell, index) => {

        // Erstellt ein neues div-Element für jedes Feld.
        const div = document.createElement("div");

        // Fügt dem div die Klasse "board-cell" hinzu, um es zu stylen.
        div.classList.add("board-cell");

        // Wenn in diesem Spielfeld "X" oder "O" steht, bekommt es zusätzlich eine Klasse "x" oder "o", damit man z. B. mit Farbe oder Symbolen gestalten kann.
            if (cell === "X") div.classList.add("x");
            if (cell === "O") div.classList.add("o");

        // Das div zeigt den Textinhalt des Feldes an, also "X", "O" oder leer "".
        div.textContent = cell;

        // Wenn der Spieler auf dieses Feld klickt, wird die Funktion handleCellClick(index) aufgerufen. So reagiert das Spiel auf Klicks.
        div.addEventListener("click", () => handleCellClick(index));

        // Das fertig konfigurierte Feld-Element wird zum Spielfeld (boardElement) hinzugefügt.
        boardElement.appendChild(div);
    });
}

// Die Funktion erhält die Indexposition (0–8) des angeklickten Feldes.
function handleCellClick(index) {

    // Wenn das Spiel nicht aktiv ist oder das Feld bereits belegt ist, passiert nichts.
    if (!gameActive || board[index] !== "") return;

    // Das aktuelle Feld wird mit dem aktuellen Spieler (X oder O) belegt.
    board[index] = currentPlayer;

    // Das Board wird neu gerendert, um die Änderungen anzuzeigen.
    renderBoard();

    // Es wird geprüft, ob der aktuelle Spieler gewonnen hat.
    if (checkWinner(currentPlayer)) {

        // Wenn ein Gewinner da ist: Das Spiel wird gestoppt, ein Text wie „Benutzer gewinnt!“ oder „Gegner gewinnt!“ wird angezeigt und Die Punktzahl des Gewinners wird aktualisiert
        gameActive = false;
        statusText.textContent = `${currentPlayer === "X" ? username : "Gegner"} gewinnt!`; // Help
        updateScore(currentPlayer);

    //  Wenn kein Gewinn, wird geprüft, ob das Feld voll ist (also keine freien Zellen = Unentschieden).
    } else if (!board.includes("")) {

        // Wenn das Feld voll ist, wird das Spiel gestoppt und ein Text wie „Unentschieden!“ wird angezeigt.
        gameActive = false;
        statusText.textContent = "Unentschieden!";

    // Wenn es keinen Gewinner und auch kein Unentschieden gibt, wechselt der Zug zum anderen Spieler.
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus();

        // Falls der Spielmodus "pvve" ausgewählt ist und der Spieler "O" ist (also der Bot), wird der zug nach 500ms ausgeführt.
        if (gameMode.startsWith("pve") && currentPlayer === "O") {
            setTimeout(botMove, 500);
        }
    }
}

// Diese Funktion wird aufgerufen, wenn der Bot (Gegner) seinen Zug machen soll.
function botMove() {

    // Index-Position, wo der Bot sein Zug machen kann.
    let index;

    // Wenn der Spielmodus hard ist, wird die Funktion bestMove ausgeführt...
    if (gameMode === "pve-hard") {
        index = getBestMove();

    // ...ansonsten, wird ein zufälliger freier Index ausgewählt.
    } else {
        // Sortirt das das Board nach freien Zellen.
        const free = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);

        // Wählt zufällig einen freien Index aus.
        index = free[Math.floor(Math.random() * free.length)];
    }

    //  Wenn ein gültiger Zug gefunden wurde, wird die normale Spiellogik über handleCellClick(index) aufgerufen, um den Bot-Zug durchzuführen.
    if (index !== undefined) handleCellClick(index);
}

// 
function updateStatus() {
    // Der Text im Statusbereich (statusText) wird aktualisiert.
    statusText.textContent = `${currentPlayer === "X" ? username : "Gegner"} ist am Zug.`;
}

// Diese Funktion prüft, ob ein Spieler gewonnen hat.
function checkWinner(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // Horizontale Gewinnmuster
        [0,3,6],[1,4,7],[2,5,8], // Vertikale Gewinnmuster
        [0,4,8],[2,4,6]          // Diagonale Gewinnmuster
    ];

    //  Diese Zeilen prüft, ob mindestens ein dieser Muster (some) vollständig mit dem Symbol des Spielers belegt ist (every).
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

//  Findet den besten Spielzug für den Bot.
function getBestMove() {
    // Startet mit dem niedrigsmöglichem wert.
    let bestScore = -Infinity;

    // Variable für den besten Zug.
    let move;

    // Geht jedes Feld im Board durch.
    for (let i = 0; i < board.length; i++) {

        // Nur wenn das Feld leer ist, kann man es für den Zug verwenden.
        if (board[i] === "") {

            // Bot ist O und Testet den Zug.
            board[i] = "O"; 

            // Er ruft minimax function auf, um zu berechnen wie gut dieser Zug ist.
            let score = minimax(board, 0, false);

            // Er macht den Zug wieder rückgängig damit er andere Möglichkeiten prüfen kann.
            board[i] = "";

            // Wenn der Zug besser ist als der bisheriger bester Zug, wird der score aktualisiert und gespeichert.
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    // Gibt den besten Zug zurück.
    return move;
}

// Diese Funktion berechnet den Wert eines Spielzugs, indem sie alle weiteren Spielverläufe durchspielt.
function minimax(newBoard, depth, isMaximizing) {

    // Wenn Bot gewinnt → hoher Score (gut): 10 - depth
    if (checkWinner("O")) return 10 - depth;

    // Wenn Spieler gewinnt → niedriger Score (schlecht): depth - 10
    if (checkWinner("X")) return depth - 10;

    // Wenn niemand gewinnt und alles voll ist → Unentschieden: 0
    if (!newBoard.includes("")) return 0;

    
    if (isMaximizing) {
        let best = -Infinity;

        // Schleife über alle Felder. Wenn leer, wird ein "O" gesetzt (simulierter Bot-Zug).
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "O";

                // Die Simulation geht tiefer, der Spieler ist dran und der test zug wird rückgängig gemacht.
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";

                // Der beste Score wird aktualisiert, wenn der aktuelle Score besser ist.
                best = Math.max(score, best);
            }
        }

        // Gibt den besten Score zurück, wenn der Bot am Zug ist.
        return best;

    // Wenn der Spieler am Zug ist, wird der Score minimiert.
    } else {

        // Probiert alle Züge des Spielers aus und such den Zug mit dem niedrigsten score aus (schlechtester Zug für den Bot) (Höchste Warscheinlickeit für den Spieler zu gewinnen).
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
// Wird direkt nach dem Laden der Seite ausgeführt.
window.onload = function() {
    // Daten werden aus dem Browser-Speicher (LocalStorage) geladen.
    username = localStorage.getItem("username");
    email = localStorage.getItem("email");
    password = localStorage.getItem("password");
    if (username && email && password) {
        // Wenn alle Daten vorhanden sind wird die Funktion showgamesection ausgeführt, die zum Menü führt mit den gespeicherten daten.
        showgamesection(username);
    }
};

// Zeigt den Spielabschnitt an und aktualisiert den Score
function showgamesection(name) {
    username = name;
    displayName.textContent = username;

    score.player = parseInt(localStorage.getItem(`score_${email}_player`)) || 0;
    score.opponent = parseInt(localStorage.getItem(`score_${email}_opponent`)) || 0;

    // Verbesserung
    stats.wins = parseInt(localStorage.getItem(`stats_${email}_wins`)) || 0;
    stats.losses = parseInt(localStorage.getItem(`stats_${email}_losses`)) || 0;
    stats.wl = parseFloat(localStorage.getItem(`stats_${email}_wl`)) || 0;

    scoreboard.player.textContent = score.player;
    scoreboard.opponent.textContent = score.opponent;

    // Verbesserung
    scoretable.win.textContent = stats.wins;
    scoretable.lose.textContent = stats.losses;
    scoretable.wl.textContent = stats.wl;

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
    scoretable.win.textContent = "0";
    scoretable.lose.textContent = "0";
    scoretable.wl.textContent = "0";
};