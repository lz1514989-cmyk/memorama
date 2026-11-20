const emojis = ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍒", "🍍"];

let cards = [...emojis, ...emojis];
let firstCard = null;
let secondCard = null;
let lock = false;
let startTime;
let timerInterval;
let deferredPrompt = null;

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("timer").textContent =
            formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    return minutes + ":" + secs;
}

function saveBestTime(time) {
    const best = localStorage.getItem("bestTime");

    if (!best || time < Number(best)) {
        localStorage.setItem("bestTime", time);
        document.getElementById("bestTime").textContent =
            formatTime(time);
    }
}

function setupGame() {
    const board = document.getElementById("gameBoard");

    board.innerHTML = "";
    cards = shuffleArray([...emojis, ...emojis]);

    firstCard = null;
    secondCard = null;
    lock = false;

    document.getElementById("timer").textContent = "00:00";

    const best = localStorage.getItem("bestTime");

    if (best) {
        document.getElementById("bestTime").textContent =
            formatTime(Number(best));
    }

    stopTimer();

    cards.forEach((emoji, index) => {
        const div = document.createElement("div");

        div.classList.add("card");
        div.dataset.emoji = emoji;
        div.dataset.index = index;
        div.textContent = "?";

        div.addEventListener("click", flipCard);

        board.appendChild(div);
    });
}

function flipCard(event) {
    const card = event.currentTarget;

    if (lock || card.classList.contains("flipped")) {
        return;
    }

    if (!startTime) {
        startTimer();
    }

    card.classList.add("flipped");
    card.textContent = card.dataset.emoji;

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lock = true;

    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        firstCard = null;
        secondCard = null;
        lock = false;

        const matched = document.querySelectorAll(".card.flipped");

        if (matched.length === cards.length) {
            stopTimer();

            const time = Math.floor((Date.now() - startTime) / 1000);
            saveBestTime(time);

            setTimeout(() => {
                alert("¡Felicidades! Terminaste el Memorama.");
            }, 300);
        }

    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            firstCard.textContent = "?";
            secondCard.textContent = "?";

            firstCard = null;
            secondCard = null;
            lock = false;
        }, 1000);
    }
}

// Iniciar el juego
setupGame();

// Registrar el Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => console.log("Service Worker registrado"))
            .catch(error => console.log("Error:", error));
    });
}

// Instalación manual de la PWA
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredPrompt = event;

    const btn = document.getElementById("btnInstall");
    btn.style.display = "inline-block";
});

document.getElementById("btnInstall").addEventListener("click", async () => {
    if (!deferredPrompt) {
        return;
    }

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    console.log("Resultado de instalación:", result.outcome);

    deferredPrompt = null;
    document.getElementById("btnInstall").style.display = "none";
});