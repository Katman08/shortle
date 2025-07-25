// ################################################################################
// Shortle Web App - Main Script
// ################################################################################

import answerList from './answer_list.js';
import guessList from './guess_list.js';

const WORD_LENGTH = 4;
const MAX_GUESSES = 6;
let secretWord = "";
let currentRow = 0;
let board = [];
let gameOver = false;

function pickSecretWord() {
    if (answerList.length === 0) {
        console.error('Answer list not loaded yet');
        return;
    }
    const randomIndex = Math.floor(Math.random() * answerList.length);
    secretWord = answerList[randomIndex].toLowerCase();
}

function initBoard() {
    board = Array.from({ length: MAX_GUESSES }, () => Array(WORD_LENGTH).fill(""));
}

function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    
    for (let r = 0; r < MAX_GUESSES; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        
        for (let c = 0; c < WORD_LENGTH; c++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            
            if (board[r][c]) {
                cellDiv.textContent = board[r][c].toUpperCase();
                
                // Add feedback classes for completed rows (only for submitted guesses)
                if (r < currentRow) {
                    const feedback = getFeedback(board[r].map(l => l.toLowerCase()), secretWord)[c];
                    cellDiv.classList.add(feedback);
                }
            }
            
            rowDiv.appendChild(cellDiv);
        }
        boardDiv.appendChild(rowDiv);
    }
}

function renderKeyboard() {
    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";
    
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];
    
    keys.forEach((row, rowIndex) => {
        const keyRow = document.createElement("div");
        keyRow.className = "key-row";
        
        row.forEach(key => {
            const keyBtn = document.createElement("button");
            keyBtn.className = "key";
            keyBtn.textContent = key;
            
            if (key === "Enter") {
                keyBtn.id = "enter-key";
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        submitGuess();
                    }
                });
            } else if (key === "⌫") {
                keyBtn.id = "delete-key";
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        deleteLetter();
                    }
                });
            } else {
                keyBtn.addEventListener("click", () => {
                    if (!gameOver && currentRow < MAX_GUESSES) {
                        addLetter(key);
                    }
                });
            }
            
            keyRow.appendChild(keyBtn);
        });
        
        keyboardDiv.appendChild(keyRow);
    });
}

function addLetter(letter) {
    const currentGuess = board[currentRow];
    const emptyIndex = currentGuess.findIndex(cell => cell === "");
    
    if (emptyIndex !== -1 && emptyIndex < WORD_LENGTH) {
        currentGuess[emptyIndex] = letter;
        renderBoard();
    }
}

function deleteLetter() {
    const currentGuess = board[currentRow];
    const lastFilledIndex = currentGuess.map((cell, index) => cell !== "" ? index : -1).filter(index => index !== -1).pop();
    
    if (lastFilledIndex !== undefined) {
        currentGuess[lastFilledIndex] = "";
        renderBoard();
    }
}

function submitGuess() {
    const currentGuess = board[currentRow];
    
    if (currentGuess.some(cell => cell === "")) {
        showMessage("Not enough letters", "error");
        return;
    }
    
    const guessWord = currentGuess.join("").toLowerCase();

    if (!guessList.includes(guessWord)) {
        showMessage("Not in guess list", "error");
        return;
    }
    
    const feedback = getFeedback(currentGuess.map(l => l.toLowerCase()), secretWord);
    updateKeyboardColors(currentGuess, feedback);
    
    currentRow++;
    renderBoard();
    
    if (feedback.every(f => f === "correct")) {
        showMessage("You win!", "win");
        gameOver = true;
        document.getElementById("reset-btn").style.display = "block";
        return;
    }
    
    
    if (currentRow === MAX_GUESSES) {
        showMessage(`Game over! The word was: ${secretWord.toUpperCase()}`, "loss");
        gameOver = true;
        document.getElementById("reset-btn").style.display = "block";
        return;
    }
    
    showMessage("");
}

function getFeedback(guess, answer) {
    const feedback = Array(WORD_LENGTH).fill("absent");
    const answerArr = answer.split("");
    const guessArr = [...guess];
    
    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArr[i] === answerArr[i]) {
            feedback[i] = "correct";
            answerArr[i] = null;
            guessArr[i] = null;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (feedback[i] === "correct" || !guessArr[i]) continue;
        
        const idx = answerArr.findIndex(letter => letter === guessArr[i]);
        if (idx !== -1) {
            feedback[i] = "present";
            answerArr[idx] = null;
        }
    }
    
    return feedback;
}

function updateKeyboardColors(guess, feedback) {
    guess.forEach((letter, index) => {
        // Find all keys with this letter (not Enter or Delete keys)
        const keyElements = document.querySelectorAll(`.key:not(#enter-key):not(#delete-key)`);
        keyElements.forEach(keyElement => {
            if (keyElement.textContent === letter) {
                const currentClass = keyElement.className;
                const newClass = feedback[index];
                
                if (!currentClass.includes("correct")) {
                    if (newClass === "correct") {
                        keyElement.classList.remove("present", "absent");
                        keyElement.classList.add("correct");
                    } else if (newClass === "present" && !currentClass.includes("correct")) {
                        keyElement.classList.remove("absent");
                        keyElement.classList.add("present");
                    } else if (newClass === "absent" && !currentClass.includes("correct") && !currentClass.includes("present")) {
                        keyElement.classList.add("absent");
                    }
                }
            }
        });
    });
}

function showMessage(msg, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = msg;
    messageDiv.className = type ? `message ${type}` : "message";
}

function startGame() {
    pickSecretWord();
    initBoard();
    currentRow = 0;
    gameOver = false;
    renderBoard();
    renderKeyboard();
    showMessage("");
    document.getElementById("reset-btn").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    startGame();
    document.getElementById("reset-btn").addEventListener("click", startGame);
});

// Keyboard event listeners
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    
    if (e.key === "Enter") {
        if (currentRow < MAX_GUESSES) {
            e.preventDefault();
            submitGuess();
        }
    } else if (e.key === "Backspace") {
        e.preventDefault();
        deleteLetter();
    } else if (/^[A-Za-z]$/.test(e.key)) {
        e.preventDefault();
        addLetter(e.key.toUpperCase());
    }
}); 