
const createPlayer = (name, marker) => {
    return { name, marker };
};

//Gameboard (Singleton - State Manager)

const Gameboard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;

    const placeMarker = (index, marker) => {
        if (board[index] === "") {
            board[index] = marker;
            return true; 
        }
        return false; 
    };

    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    return { getBoard, placeMarker, resetBoard };
})();

//GameController (Singleton - Game Logic)

const GameController = (() => {
    let player1, player2, activePlayer;
    let isGameOver = false;

    const initializeGame = (p1Name, p2Name) => {
        player1 = createPlayer(p1Name || "Player 1", "X");
        player2 = createPlayer(p2Name || "Player 2", "O");
        activePlayer = player1;
        isGameOver = false;
        Gameboard.resetBoard();
    };

    const getActivePlayer = () => activePlayer;
    const getGameState = () => isGameOver;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player1 ? player2 : player1;
    };

    const playRound = (index) => {
        if (isGameOver) return; // Prevent moves after the game ends

        if (Gameboard.placeMarker(index, activePlayer.marker)) {
            // Check for terminal states immediately after a successful move
            if (checkWin()) {
                isGameOver = true;
                return { status: "win", winner: activePlayer.name };
            }
            if (checkTie()) {
                isGameOver = true;
                return { status: "tie" };
            }

            switchPlayerTurn();
            return { status: "continue" }; // Move was valid, game continues
        }
        return { status: "invalid" }; // Move was invalid (cell full)
    };

    const checkWin = () => {
        const b = Gameboard.getBoard();
        const winStates = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        return winStates.some(combo => combo.every(idx => b[idx] === activePlayer.marker));
    };

    const checkTie = () => !Gameboard.getBoard().includes("");

    return { initializeGame, playRound, getActivePlayer, getGameState };
})();


// DisplayController (Singleton - DOM Manipulation)


const DisplayController = (() => {
    const boardCells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status-text');
    const p1Card = document.getElementById('player1-card');
    const p2Card = document.getElementById('player2-card');
    const restartBtn = document.getElementById('restart-btn');
    const modal = document.getElementById('result-modal');
    const modalMessage = document.getElementById('result-message');
    const modalRestartBtn = document.getElementById('modal-restart-btn');

    // Start a fresh game
    const setupGame = () => {
        const p1Name = document.getElementById('player1-name').value;
        const p2Name = document.getElementById('player2-name').value;
        
        GameController.initializeGame(p1Name, p2Name);
        renderBoard();
        updateTurnDisplay();
        statusText.textContent = "Game On";
        modal.close();
    };

    // Wipe the HTML cells and rebuild based on the Array state
    const renderBoard = () => {
        const currentBoard = Gameboard.getBoard();
        boardCells.forEach((cell, index) => {
            cell.textContent = currentBoard[index]; // Inject "X" or "O"
            
            // Clean up old color classes, then re-apply if occupied
            cell.classList.remove('x', 'o');
            if (currentBoard[index] !== "") {
                cell.classList.add(currentBoard[index].toLowerCase());
            }
        });
    };

    // Toggle CSS classes to highlight the active player's name
    const updateTurnDisplay = () => {
        if (GameController.getGameState()) return; // Don't switch UI if game is over

        const currentPlayer = GameController.getActivePlayer();
        if (currentPlayer.marker === "X") {
            p1Card.classList.add('active');
            p2Card.classList.remove('active');
        } else {
            p2Card.classList.add('active');
            p1Card.classList.remove('active');
        }
    };

    // The main Event Handler for clicking a square
    const handleCellClick = (e) => {
        const index = e.target.getAttribute('data-index');
        
        // Pass the index to the referee logic
        const result = GameController.playRound(index);
        
        if (result && result.status !== "invalid") {
            renderBoard(); // Update UI if the move was accepted
            
            if (result.status === "win") {
                statusText.textContent = "Game Over";
                modalMessage.textContent = `${result.winner} Wins!`;
                modal.showModal();
            } 
            else if (result.status === "tie") {
                statusText.textContent = "Game Over";
                modalMessage.textContent = "It's a Tie!";
                modal.showModal();
            } 
            else {
                updateTurnDisplay(); // If "continue", switch the highlight
            }
        }
    };

    // Event Listeners Initialization
    boardCells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', setupGame);
    modalRestartBtn.addEventListener('click', setupGame);

    // Initial load
    setupGame();

    // Explicitly return nothing. This module just runs and binds events.
})();