const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const collisionSound = document.getElementById('collision-sound');
const gameoverSound = document.getElementById('gameover-sound');
const paddleWidth = 100, paddleHeight = 10;
const ballRadius = 10;
let paddleSpeed = 7;
let ballSpeedX = 7, ballSpeedY = -7; // Set initial Y speed to negative to ensure it goes towards the bot
const paddle1 = { x: canvas.width / 2 - paddleWidth / 2, y: 20, color: 'cyan' };
const paddle2 = { x: canvas.width / 2 - paddleWidth / 2, y: canvas.height - 30, color: 'cyan' };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: ballRadius };
let gameOver = false;
let moveLeft = false;
let moveRight = false;
let userScore = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Update high score display
document.getElementById('high-score').innerText = `High Score: ${highScore}`;
document.getElementById('current-score').innerText = `Score: ${userScore}`;

// Event Listeners for control buttons
document.getElementById('left-button').addEventListener('mousedown', (e) => {
	e.preventDefault();
moveLeft = true;
    });
    document.getElementById('left-button').addEventListener('mouseup', () => moveLeft = false);
    document.getElementById('left-button').addEventListener('mouseleave', () => moveLeft = false);
    document.getElementById('left-button').addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveLeft = true;
    });
    document.getElementById('left-button').addEventListener('touchend', (e) => {
        e.preventDefault();
        moveLeft = false;
    });

    document.getElementById('right-button').addEventListener('mousedown', (e) => {
        e.preventDefault();
        moveRight = true;
    });
    document.getElementById('right-button').addEventListener('mouseup', () => moveRight = false);
    document.getElementById('right-button').addEventListener('mouseleave', () => moveRight = false);
    document.getElementById('right-button').addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveRight = true;
    });
    document.getElementById('right-button').addEventListener('touchend', (e) => {
        e.preventDefault();
        moveRight = false;
    });

    document.getElementById('restart-button').addEventListener('click', restartGame);

    // Game Loop
    function gameLoop() {
        if (gameOver) return;
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    // Update game state
    function update() {
        // Move player's paddle based on button press
        if (moveLeft && paddle2.x > 0) {
            paddle2.x -= paddleSpeed;
        }
        if (moveRight && paddle2.x < canvas.width - paddleWidth) {
            paddle2.x += paddleSpeed;
        }

        // Bot (Computer) Player Logic - Make sure it always hits the ball
        if (ballSpeedY < 0) { // Ball moving towards the bot paddle
            const botSpeedAdjustment = Math.min(20, Math.abs(ballSpeedY) * 0.5); // Adjust the bot speed to ensure it can always reach the ball
            paddle1.x += (ball.x - (paddle1.x + paddleWidth / 2)) * 0.1 * botSpeedAdjustment; // Smoothly follow the ball
            if (paddle1.x < 0) paddle1.x = 0;
            if (paddle1.x > canvas.width - paddleWidth) paddle1.x = canvas.width - paddleWidth;
        }

        ball.x += ballSpeedX;
        ball.y += ballSpeedY;

        if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
            ballSpeedX = -ballSpeedX;
            triggerBorderCollisionEffect();
            playCollisionSound();
        }

        if (ballCollidesWithPaddle(paddle1)) {
            ballSpeedY = -ballSpeedY;
            ball.y = paddle1.y + paddleHeight + ball.radius;
            triggerCollisionEffect(paddle1);
            playCollisionSound();
        }

        if (ballCollidesWithPaddle(paddle2)) {
            ballSpeedY = -ballSpeedY;
            ball.y = paddle2.y - ball.radius;
            userScore++;
            updateScoreAnimation(userScore);
            updateCurrentScore();
            updateHighScore();
            triggerCollisionEffect(paddle2);
            playCollisionSound();

            // Increase ball and paddle speed every 7 points
            if (userScore % 5 === 0) {
                ballSpeedX += ballSpeedX > 0 ? 2 : -2;
                ballSpeedY += ballSpeedY > 0 ? 2 : -2;
                paddleSpeed++;
            }
        }

        if (ball.y + ball.radius < 0 || ball.y - ball.radius > canvas.height) {
            gameOver = true;
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('restart-button').style.display = 'block';
            playGameoverSound(); // Play gameover sound
        }
    }

    // Ball collision detection
    function ballCollidesWithPaddle(paddle) {
        return ball.x > paddle.x &&
               ball.x < paddle.x + paddleWidth &&
               ball.y + ball.radius > paddle.y &&
               ball.y - ball.radius < paddle.y + paddleHeight;
    }

    // Render game elements
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw paddles
        ctx.fillStyle = paddle1.color;
        ctx.fillRect(paddle1.x, paddle1.y, paddleWidth, paddleHeight);
        ctx.fillStyle = paddle2.color;
        ctx.fillRect(paddle2.x, paddle2.y, paddleWidth, paddleHeight);
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'magenta';
        ctx.fill();
        ctx.closePath();
    }

    // Trigger collision effect for paddles
    function triggerCollisionEffect(paddle) {
        paddle.color = 'magenta'; // Change color on collision
        setTimeout(() => {
            paddle.color = 'cyan'; // Revert color after 100ms
        }, 100);
    }

    // Trigger collision effect for border
    function triggerBorderCollisionEffect() {
        canvas.style.boxShadow = '0 0 40px magenta';
        setTimeout(() => {
            canvas.style.boxShadow = '0 0 20px cyan';
        }, 100);
    }

    // Play collision sound
    function playCollisionSound() {
        collisionSound.currentTime = 0;
        collisionSound.play();
    }

    // Play game over sound
    function playGameoverSound() {
        gameoverSound.currentTime = 0;
        gameoverSound.play();
    }

    // Update and animate the score
    function updateScoreAnimation(score) {
        const scoreAnimation = document.getElementById('score-animation');
        scoreAnimation.innerText = score;
        scoreAnimation.style.transform = 'scale(1)';
        scoreAnimation.style.opacity = '1';

        // Trigger animation
        setTimeout(() => {
            scoreAnimation.style.overflow = "hidden";
            scoreAnimation.style.transform = 'scale(10)';
            scoreAnimation.style.opacity = '0';
        }, 300);
    }

    // Update current score display
    function updateCurrentScore() {
        document.getElementById('current-score').innerText = `Score: ${userScore}`;
    }

    // Update high score in local storage
    function updateHighScore() {
        if (userScore > highScore) {
            highScore = userScore;
            localStorage.setItem('highScore', highScore);
            document.getElementById('high-score').innerText = `High Score: ${highScore}`;
        }
    }

    // Reset ball to center
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ballSpeedY = -Math.abs(ballSpeedY); // Ensure the ball always goes towards the bot initially
    }

    // Restart the game
    function restartGame() {
        gameOver = false;
        userScore = 0;
        updateCurrentScore();
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('restart-button').style.display = 'none';
        location.href = "game.html";
        resetBall();
        gameLoop();
    }

    // Start the game loop
    gameLoop();
