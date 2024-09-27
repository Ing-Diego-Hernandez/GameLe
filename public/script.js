const imageContainer = document.getElementById('game-image');
const attemptsElement = document.getElementById('attempts-left');
const resultContainer = document.getElementById('result-container');
const guessInput = document.getElementById('guess-input');

// Cargar la imagen del juego al inicio
async function loadGame() {
    const response = await fetch('/game-image');
    const data = await response.json();
    imageContainer.src = data.image;
    attemptsElement.innerText = data.attemptsLeft;
}

// Enviar la conjetura al servidor
async function submitGuess() {
    const guess = guessInput.value;
    if (!guess) return;
    
    const response = await fetch('/check-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess })
    });
    
    const data = await response.json();
    displayResult(data.result);
    attemptsElement.innerText = data.attemptsLeft;
    
    if (data.gameOver) {
        if (data.won) {
            alert("Congratulations! You guessed the correct game!");
        } else {
            alert("Game over! The correct game was " + data.correctName);
        }
    }
}

// Mostrar el resultado de la conjetura
function displayResult(result) {
    resultContainer.innerHTML = '';
    result.forEach(item => {
        const span = document.createElement('span');
        span.innerText = item.letter;
        if (item.status === 'correct') {
            span.classList.add('correct-letter');
        } else if (item.status === 'misplaced') {
            span.classList.add('wrong-position');
        } else {
            span.classList.add('wrong-letter');
        }
        resultContainer.appendChild(span);
    });
}

// Reiniciar el juego
async function restartGame() {
    await fetch('/restart', { method: 'POST' });
    guessInput.value = '';
    resultContainer.innerHTML = '';
    loadGame();
}

// Cargar el juego al iniciar
window.onload = loadGame;
