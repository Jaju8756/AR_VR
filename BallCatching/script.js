// Variables for game logic
let score = 0;
let fallingSpeed = 0.01;
let handX = 0; // Position controlled by hand movement
let gameActive = true;

const player = document.getElementById('player');
const star = document.getElementById('star');
const scoreDisplay = document.getElementById('score');
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Variables for motion detection
let previousFrameData = null;
const motionThreshold = 20; // Sensitivity for motion detection

// Function to start game loop and move the star
function startGame() {
  requestAnimationFrame(updateGame);
}

// Update game state
function updateGame() {
  if (gameActive) {
    // Move the falling star down
    let starPos = star.getAttribute('position');
    starPos.y -= fallingSpeed;

    // Reset star if it goes below the player
    if (starPos.y < -1.5) {
      resetStarPosition();
    }

    // Check for collision (player catches the star)
    let playerPos = player.getAttribute('position');
    if (Math.abs(playerPos.x - starPos.x) < 0.3 && starPos.y <= -1) {
      score++;
      updateScore();
      resetStarPosition();
    }

    // Update star position
    star.setAttribute('position', starPos);

    // Move player based on hand movements (X-axis only)
    player.setAttribute('position', { x: handX, y: -1, z: -3 });

    // Continue game loop
    requestAnimationFrame(updateGame);
  }
}

// Reset star position to top
function resetStarPosition() {
  let randomX = (Math.random() * 4 - 2).toFixed(2); // Random X between -2 and 2
  star.setAttribute('position', { x: randomX, y: 3, z: -3 });
}

// Update score display
function updateScore() {
  scoreDisplay.innerText = `Score: ${score}`;
}

// Webcam video setup
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.error("Error accessing the webcam: ", err);
  });

// Motion detection algorithm
function detectMotion() {
  // Draw the current video frame on the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = currentFrameData.data;

  if (previousFrameData) {
    let leftMotion = 0;
    let rightMotion = 0;
    const halfWidth = canvas.width / 2;

    // Compare current frame with previous frame
    for (let i = 0; i < data.length; i += 4) {
      const motion = Math.abs(data[i] - previousFrameData[i]) // Red
                    + Math.abs(data[i + 1] - previousFrameData[i + 1]) // Green
                    + Math.abs(data[i + 2] - previousFrameData[i + 2]); // Blue

      const x = (i / 4) % canvas.width;

      if (x < halfWidth) {
        leftMotion += motion;
      } else {
        rightMotion += motion;
      }
    }

    // If there's more motion on the left side, move the ball left, and vice versa
    if (leftMotion > rightMotion + motionThreshold) {
      handX = Math.max(handX - 0.1, -2); // Move left
    } else if (rightMotion > leftMotion + motionThreshold) {
      handX = Math.min(handX + 0.1, 2);  // Move right
    }
  }

  // Save current frame data for next comparison
  previousFrameData = data.slice();

  requestAnimationFrame(detectMotion);
}

// Start motion detection
detectMotion();

// Start the game
document.addEventListener('DOMContentLoaded', startGame);
