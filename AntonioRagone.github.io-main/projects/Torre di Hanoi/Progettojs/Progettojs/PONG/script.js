// Viariabili Globali
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [3, 3, 3];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];
 
// Definizione Oggetto palla
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7 
        };
    }
};
 
// Definizione Oggetto AI
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};
 
//Per fare dei suoni al contatto della palla
var playerHitSound = document.getElementById('playerHitSound');
var aiHitSound = document.getElementById('aiHitSound');
var wallHitSound = document.getElementById('wallHitSound');
var roundPassedSound = document.getElementById('roundPassedSound');
var playerWinSound = document.getElementById('playerWinSound');
var playerLoseSound = document.getElementById('playerLoseSound');


var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#8c52ff';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        // Cambia il colore font e grandezza del canvas
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        // Disegna il rettangolo dietro la scritta 'Premi qualsiasi tasto per iniziare'
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        
 
        // Cambia il colore del canvas
        Pong.context.fillStyle = '#ffffff';
 
        // Disegna la scritta di fine gioco ('Game Over' o 'Vincitore')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );

        if (text === 'javascript') {
            playerWinSound.play();
        } else {
            playerLoseSound.play();
        }
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // Disegna tutti gli oggetti pong nel loro stato attuale
        Pong.draw();
 
        // Cambia il colore font e grandezza del canvas
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        // Disegna il rettangolo dietro la scritta 'Premi qualsiasi tasto per iniziare'
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Cambia il colore del canvas
        this.context.fillStyle = '#ffffff';
 
        // Scrive il testo 'Premere Qualsiasi tasto per Iniziare'
        this.context.fillText('Premi Qualsiasi tasto per Iniziare',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // Aggiorna tutti gli oggetti
    update: function () {
        if (!this.over) {
            // Se la palla colpisce i limiti della mappa- Correggi le coordinate x e y.
            if (this.ball.x <= 0){
                Pong._resetTurn.call(this, this.ai, this.player);
                wallHitSound.play();
            } 
            if (this.ball.x >= this.canvas.width - this.ball.width){
                Pong._resetTurn.call(this, this.player, this.ai);
                wallHitSound.play();
            }
             
            if (this.ball.y <= 0){
                this.ball.moveY = DIRECTION.DOWN;
                wallHitSound.play();
            }
            if (this.ball.y >= this.canvas.height - this.ball.height){
                this.ball.moveY = DIRECTION.UP;
                wallHitSound.play();
            }
            
 
            // Muovi il giocatore. il valore 'move' è aggiornato da tastiera
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 
            // in una nuova battuta (Inizio di ogni turno) muovi la palla al lato giusto
            // e randomizza la direzione

            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
 
            // Se il giocatore tocca i limiti della mappa,aggiorna le coordinate x e y.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            // Muovi la palla nella direzione imbase alle coordinate x e y
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Gestisci l'AI con i movimenti UP e DOWN
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            // Gestisci le collisioni con l'AI
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            // Gestisci le collisioni con giocatore e palla
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    playerHitSound.play();
                }
            }
 
            // gestisci le collisioni con la palla e l'aria
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    aiHitSound.play();
                }
            }
        }
 
        // gestisci la transizione da round a round
        // controlla se il giocatore ha vinto il round.
        if (this.player.score === rounds[this.round]) {
            // controlla se ci sono altri round
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { 
                    Pong.endGameMenu('javascript'); 
                    roundPassedSound.play();
                }, 1000);
            } else {
                // Se ci sono altri round, azzera il punteggio e incrementa il valore round
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 3;
                this.ball.speed += 3;
                this.round += 1;
                roundPassedSound.play();
            }
        }
        // Controlla se l'Ai ha vinto il round
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },
 
    // Disegna gli oggetti nel canvas
    draw: function () {
        // Pulisci il canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // setta lo stile fill in nero
        this.context.fillStyle = this.color;
 
        // Disegna il background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Setta lo stile fill in bianco
        this.context.fillStyle = '#ffffff';
 
        // Disegna il giocatore
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        // DIsegna l'AI
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        // Disegna la palla
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // Disegna la rete
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        // Setta il canvas di base
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        // Disegna il punteggio del giocatore a sinistra
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Disegna il punteggio del'Ai a destra
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // Cambia il la grandezza del font per il punteggio centrale
        this.context.font = '30px Courier New';
 
        // Disegna il punteggio vincente
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
 
        // Cambia il font size per il valore di punteggio centrale 
        this.context.font = '40px Courier';
 
        // Disegna il numero 'round'
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // Se il gioco non è finito, disegna il prossimo frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Gesisti la funzione 'Premere qualsiasi tasto per iniziare'.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            // Gestisci gli eventi freccia in alto e w
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
 
            // Gestisci gli eventi freccia in basso e s
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });
 
        // Ferma il giocatore quando non ci sono tasti premuti.
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
    },
 
    // resetta la location della palla, il turno del giocatore è riterdato prima di un nuovo round.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Aspetta per un delay ongi turno.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    // Seleziona un colore random in brackground per ogni round.
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }

    
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();