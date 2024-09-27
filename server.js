const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');


const app = express();
const PORT = 3000;

// Cargar lista de videojuegos desde un archivo JSON
const games = JSON.parse(fs.readFileSync('./data/games.json', 'utf-8'));

// Juego actual
let currentGame = null;
let attemptsLeft = 6;

// Middleware para servir archivos estáticos (HTML, CSS, imágenes)
app.use(express.static('public'));
app.use(express.json()); // Para analizar JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());

// Ruta para obtener una imagen aleatoria de un videojuego
app.get('/game-image', (req, res) => {
    if (!currentGame) {
        const randomIndex = Math.floor(Math.random() * games.length);
        currentGame = games[randomIndex];
        attemptsLeft = 6;
    }
    res.json({ image: `../images/${currentGame.image}`, attemptsLeft });
});

// Ruta para verificar la conjetura del usuario
app.post('/check-guess', (req, res) => {
    const { guess } = req.body;

    if (!guess || attemptsLeft <= 0) {
        return res.status(400).json({ message: 'Invalid guess or no attempts left.' });
    }

    let result = [];
    const correctName = currentGame.name.toLowerCase();

    // Verificar letra por letra
    for (let i = 0; i < guess.length; i++) {
        if (i < correctName.length) {
            if (guess[i].toLowerCase() === correctName[i]) {
                result.push({ letter: guess[i], status: 'correct' });
            } else if (correctName.includes(guess[i].toLowerCase())) {
                result.push({ letter: guess[i], status: 'misplaced' });
            } else {
                result.push({ letter: guess[i], status: 'wrong' });
            }
        } else {
            result.push({ letter: guess[i], status: 'wrong' });
        }
    }

    // Reducir intentos y comprobar victoria/derrota
    attemptsLeft--;
    let gameOver = false;
    let won = false;
    if (guess.toLowerCase() === correctName) {
        gameOver = true;
        won = true;
    } else if (attemptsLeft === 0) {
        gameOver = true;
    }

    res.json({ result, attemptsLeft, gameOver, won, correctName: gameOver && !won ? currentGame.name : null });
});

// Ruta para reiniciar el juego
app.post('/restart', (req, res) => {
    currentGame = null;
    res.json({ message: 'Game restarted' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
