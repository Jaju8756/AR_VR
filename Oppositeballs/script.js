// Handtrack.js model and detection settings
let model = null;
const video = document.getElementById('webcam');
const bird = document.getElementById('bird');

// Model parameters for hand detection
const modelParams = {
  flipHorizontal: true,   // Flip the video horizontally (webcam mirror mode)
  maxNumBoxes: 1,         // Detect only one hand
  iouThreshold: 0.5,      // IoU threshold for hand detection
  scoreThreshold: 0.6,    // Confidence threshold
};

// Load the Handtrack.js model and start detecting
handTrack.load(modelParams).then(lmodel => {
  model = lmodel;
  handTrack.startVideo(video).then(status => {
    if (status) {
      runDetection();
    } else {
      alert("Please enable your webcam for hand movement control.");
    }
  });
});

// Function to detect hand and move the bird
function runDetection() {
  model.detect(video).then(predictions => {
    if (predictions.length > 0) {
      // Get the position of the detected hand
      const hand = predictions[0].bbox;
      const handX = hand[0] + hand[2] / 2; // X center of the hand
      const handY = hand[1] + hand[3] / 2; // Y center of the hand

      // Map hand coordinates to AR world coordinates
      const normalizedX = (handX / video.width) * 2 - 1; // Normalize X to [-1, 1]
      const normalizedY = (handY / video.height) * 2 - 1; // Normalize Y to [-1, 1]

      // Move the bird based on hand position (invert Y because of screen coordinates)
      bird.setAttribute('position', {
        x: normalizedX * 5,    // Scale to fit AR scene
        y: -normalizedY * 3,   // Invert Y-axis
        z: -3                 // Keep bird at a fixed distance
      });
    }

    // Continuously run detection
    requestAnimationFrame(runDetection);
  });
}
