let playerName = "";
        let cardColor = "#333";
        let isSoundEnabled = true;

        const canvas = document.getElementById("memoryCanvas");
        const ctx = canvas.getContext("2d");

        let cardWidth;
        let cardHeight;
        let margin;

        let cards = [];
        let flippedCards = [];
        let matchedCards = [];
        let isFlipping = false;
        let isMatched = false;
        let errorCount = 0;
        let timeLeft = 120;
        let timerId = null;

        let audioContext;
        let gainNode;
        let pannerNode;
        let filterNode;

        function iniciarJuego() {
            playerName = document.getElementById("name").value;
            if (!playerName) {
                alert("Por favor, ingresa tu nombre antes de comenzar el juego.");
                return;
            }

            cardColor = document.getElementById("color").value;

            timeLeft = 120;

            iniciarTemporizador();

            cardWidth = canvas.width / 5 - 10;
            cardHeight = canvas.height / 4 - 10;
            margin = 10;

            cards = generarCartas();
            flippedCards = [];
            isFlipping = false;
            errorCount = 0;

            document.getElementById("playerName").innerText = `Jugador: ${playerName}`;
            document.getElementById("errorCount").innerText = `Errores: ${errorCount}`;

            dibujarTablero();
        }

        let tiempoPausado = null;

function pausarJuego() {
    if (timerId) {
        clearInterval(timerId);
        tiempoPausado = timeLeft;
    }
}

function resumenJuego() {
    if (tiempoPausado !== null) {
        iniciarTemporizador(tiempoPausado);
        tiempoPausado = null;
    }
}

function iniciarTemporizador(tiempoInicial = null) {
    if (tiempoInicial !== null) {
        timeLeft = tiempoInicial;
    } else {
        const timeInput = document.getElementById("timeInput");
        timeLeft = Number(timeInput.value);
    }

    detenerTemporizador();
    timerId = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            alert("¡Tiempo agotado!");
            timeLeft = 120;
            document.getElementById("timer").innerText = timeLeft + " segundos restantes";
        } else {
            document.getElementById("timer").innerText = timeLeft + " segundos restantes";
        }
    }, 1000);
    }

        function detenerTemporizador() {
            clearInterval(timerId);
        }

        function finJuego() {
            alert("El juego ha terminado.");
            detenerTemporizador();
        }

        function revelarCartas() {
            cards.forEach(card => {
                card.isFlipped = true;
            });

            dibujarTablero();

            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.isMatched) {
                        card.isFlipped = false;
                    }
                });
                dibujarTablero();
            }, 1500);
        }

        canvas.addEventListener("click", manejarClickCarta);

        function generarCartas() {
            const icons = [
                "./imagenes/libro1.png", 
                "./imagenes/libro2.png", 
                "./imagenes/libro3.png", 
                "./imagenes/libro4.png", 
                "./imagenes/libro5.png", 
                "./imagenes/libro6.png", 
                "./imagenes/libro7.png", 
                "./imagenes/libro8.jpg", 
                "./imagenes/libro9.jpg", 
                "./imagenes/libro10.png"
            ];
            const shuffledIcons = icons.concat(icons).sort(() => Math.random() - 0.5);

            const generatedCards = [];
            for (let i = 0; i < 5 * 4; i++) {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const card = {
                    icon: shuffledIcons[i],
                    x: col * (cardWidth + margin),
                    y: row * (cardHeight + margin),
                    isFlipped: false,
                    isMatched: false,
                };
                generatedCards.push(card);
            }

            return generatedCards;
        }

        function dibujarCarta(card) {
            if (card.isFlipped) {
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, card.x, card.y, cardWidth, cardHeight);
                }
                img.src = card.icon;
            } else {
                ctx.fillStyle = cardColor;
                ctx.fillRect(card.x, card.y, cardWidth, cardHeight);
            }
        }

        function dibujarTablero() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cards.forEach(dibujarCarta);
        }

        function manejarClickCarta(event) {
            if (isFlipping) return;
            
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const clickedCard = obtenerCartaClic(mouseX, mouseY);

            if (clickedCard && !clickedCard.isFlipped && flippedCards.length < 2) {
                flippedCards.push(clickedCard);
                clickedCard.isFlipped = true;
                dibujarTablero();

                if (flippedCards.length === 2) {
                    isFlipping = true;
                    setTimeout(verificarEmparejamiento, 1000);
                }
            }
        }

        function obtenerCartaClic(mouseX, mouseY) {
            return cards.find(card => (
                mouseX >= card.x && mouseX <= card.x + cardWidth &&
                mouseY >= card.y && mouseY <= card.y + cardHeight
            ));
        }

        function verificarVictoria() {
            return cards.every(card => card.isMatched);
        }

        function reiniciarJuego() {
            detenerTemporizador();
            cards = [];
            flippedCards = [];
            matchedCards = [];
            totalCartas = 0;
            isFlipping = false;
            isMatched = false;
            errorCount = 0;
            timeLeft = 120;
            timerId = null;
            document.getElementById("playerName").innerText = "";
            document.getElementById("errorCount").innerText = `Errores: 0`;
            dibujarTablero();
            alert("¡Felicidades! Has encontrado todos los pares de cartas. Por favor, ingresa nuevos datos para comenzar una nueva partida.");
        }

        function verificarEmparejamiento() {
            const [card1, card2] = flippedCards;

            if (card1.icon === card2.icon) {
                card1.isFlipped = true;
                card2.isFlipped = true;
                card1.isMatched = true;
                card2.isMatched = true;
            } else {
                card1.isFlipped = false;
                card2.isFlipped = false;
                errorCount++;
                document.getElementById("errorCount").innerText = `Errores: ${errorCount}`;
            }

            flippedCards = [];
            isFlipping = false;
            dibujarTablero();

            if (verificarVictoria()) {
                reiniciarJuego();
            }
        }

        function inicializarAudio() {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            gainNode = audioContext.createGain();
            pannerNode = audioContext.createStereoPanner();
            filterNode = audioContext.createBiquadFilter();

            gainNode.connect(pannerNode);
            pannerNode.connect(filterNode);
            filterNode.connect(audioContext.destination);

            ajustarFrecuencia(1000);
        }

        inicializarAudio();

        function reproducirSonidoFondo() {
            const backgroundSound = document.getElementById("backgroundSound");
            const source = audioContext.createMediaElementSource(backgroundSound);
            source.connect(gainNode);
            backgroundSound.play();
        }

        function alternarSonido() {
            const backgroundSound = document.getElementById("backgroundSound");
            const toggleSoundButton = document.getElementById("toggleSoundButton");

            if (isSoundEnabled) {
                backgroundSound.pause();
                toggleSoundButton.innerText = "Sonido off";
            } else {
                backgroundSound.play();
                toggleSoundButton.innerText = "Sonido on";
            }

            isSoundEnabled = !isSoundEnabled;
        }

        function ajustarVolumen(volumen) {
            gainNode.gain.value = volumen;
        }

        function ajustarEstereo(pan) {
            pannerNode.pan.value = pan;
        }

        function ajustarFrecuencia(frecuencia) {
            filterNode.frequency.value = frecuencia;
            console.log(`Frecuencia ajustada a: ${frecuencia} Hz`);
        }

        reproducirSonidoFondo();