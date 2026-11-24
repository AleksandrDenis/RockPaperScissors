/* Event is fired when the whole page has loaded */
window.addEventListener('load', function () {
    // select all elements
    const playerScoreBoard = document.getElementById('player-score');
    const computerScoreBoard = document.getElementById('comp-score');
    const showComputerChoice = document.getElementById('comp-choice');
    const showPlayerChoice = document.getElementById('player-choice');
    const playerIcon = document.getElementById('player-icon');
    const compIcon = document.getElementById('comp-icon');
    const availableChoices = document.querySelectorAll('.player-btn');
    const showOutcome = document.getElementById('result');
    const roundCounter = document.getElementById('round');
    const startOver = document.getElementById('reset');
    const muteButton = document.getElementById('mute');
    const sound = document.querySelector('#sound');
    const choiceCards = document.querySelectorAll('.choice-card');

    // game settings and state
    const WIN_SCORE = 5;
    const choices = ['rock', 'paper', 'scissors'];
    const icons = { rock: '✊', paper: '✋', scissors: '✌️' };
    // each key beats its value
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

    let playerChoice;
    let computerChoice;
    let playerScore = 0;
    let computerScore = 0;
    let round = 1;
    let gameOver = false;
    let muted = false;

    document.getElementById('target').textContent = WIN_SCORE;

    /**
     * Play a sound, ignoring browser autoplay errors
     */
    function playSound(name) {
        if (muted) return;
        sound.setAttribute('src', 'assets/sound/' + name + '.mp3');
        const promise = sound.play();
        if (promise !== undefined) {
            promise.catch(() => { /* sound blocked or file missing, game still works */ });
        }
    }

    /**
     * Player makes a choice
     * Play one round, then check if the match is over
     */
    function playRound(choice) {
        if (gameOver) return;
        playerChoice = choice;
        getComputerChoices();
        pickWinner();
    }

    // click on the buttons (currentTarget so it always works, even if the button has child elements)
    availableChoices.forEach(btn => btn.addEventListener('click', (e) => {
        playRound(e.currentTarget.id);
    }));

    // keyboard shortcuts: R, P, S
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const keys = { r: 'rock', p: 'paper', s: 'scissors' };
        const choice = keys[e.key.toLowerCase()];
        if (choice) playRound(choice);
    });

    /**
     * Get random choice for computer
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     */
    function getComputerChoices() {
        computerChoice = choices[Math.floor(Math.random() * choices.length)];
    }

    /**
     * Show both choices on screen and restart the shake animation
     */
    function showChoices() {
        showPlayerChoice.textContent = playerChoice;
        showComputerChoice.textContent = computerChoice;
        playerIcon.textContent = icons[playerChoice];
        compIcon.textContent = icons[computerChoice];
        choiceCards.forEach(card => {
            card.classList.remove('shake');
            void card.offsetWidth; // restart animation
            card.classList.add('shake');
        });
    }

    function setOutcome(text, type) {
        showOutcome.textContent = text;
        showOutcome.className = 'result ' + type;
    }

    function setCardStates(playerState, compState) {
        choiceCards[0].classList.remove('win', 'lose', 'draw');
        choiceCards[1].classList.remove('win', 'lose', 'draw');
        choiceCards[0].classList.add(playerState);
        choiceCards[1].classList.add(compState);
    }

    function bump(el) {
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
    }

    /**
     * Work out who won the round and update the scores
     * logic adapted from https://stackoverflow.com/questions/66247447/need-help-for-solving-switch-case-statement-for-rock-paper-scissors
     */
    function pickWinner() {
        showChoices();

        if (playerChoice === computerChoice) {
            setOutcome("It's a draw!", 'draw');
            setCardStates('draw', 'draw');
            playSound('draw');
        } else if (beats[playerChoice] === computerChoice) {
            playerScore++;
            playerScoreBoard.textContent = playerScore;
            bump(playerScoreBoard);
            setOutcome('You win this round!', 'win');
            setCardStates('win', 'lose');
            playSound('winner');
        } else {
            computerScore++;
            computerScoreBoard.textContent = computerScore;
            bump(computerScoreBoard);
            setOutcome('You lose this round!', 'lose');
            setCardStates('lose', 'win');
            playSound('lost');
        }

        round++;
        roundCounter.textContent = round;
        checkMatchEnd();
    }

    /**
     * End the match when someone reaches the winning score
     */
    function checkMatchEnd() {
        if (playerScore < WIN_SCORE && computerScore < WIN_SCORE) return;
        gameOver = true;
        availableChoices.forEach(btn => btn.disabled = true);
        if (playerScore === WIN_SCORE) {
            setOutcome('You won the match! 🎉', 'win');
        } else {
            setOutcome('Computer won the match.', 'lose');
        }
        startOver.classList.add('attention');
        startOver.focus();
    }

    // reset button: set scores back to 0 without reloading the page
    startOver.addEventListener('click', () => {
        playerScore = 0;
        computerScore = 0;
        round = 1;
        gameOver = false;
        playerScoreBoard.textContent = 0;
        computerScoreBoard.textContent = 0;
        roundCounter.textContent = 1;
        showPlayerChoice.textContent = '-';
        showComputerChoice.textContent = '-';
        playerIcon.textContent = '?';
        compIcon.textContent = '?';
        choiceCards.forEach(card => card.classList.remove('win', 'lose', 'draw', 'shake'));
        availableChoices.forEach(btn => btn.disabled = false);
        startOver.classList.remove('attention');
        setOutcome('Make your choice!', '');
    });

    // mute button
    muteButton.addEventListener('click', () => {
        muted = !muted;
        muteButton.setAttribute('aria-pressed', muted);
        muteButton.textContent = muted ? 'Sound off' : 'Sound on';
        muteButton.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    });
});
