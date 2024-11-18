// const scene = new THREE.Scene(); // creates a 3D scene where all objects, lights, and cameras will be added
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // simulates a human eye, with a 75-degree field of view.
// const renderer = new THREE.WebGLRenderer(); // render the scene to the HTML canvas, using WebGL
// renderer.setSize(window.innerWidth, window.innerHeight); // sets the canvas size to match the window size
// document.body.appendChild(renderer.domElement); // Without this, your 3D scene would be rendered but not displayed

// // Add a basic candle model (Cylinder)
// const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32); // candle is represented as a cylinder
// const candleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // give the candle a solid yellow color
// const candle = new THREE.Mesh(candleGeometry, candleMaterial); // creating a candle object using the geometry and material
// scene.add(candle); // candle is added to the scene 

// // Add a fire (Sphere that we'll scale to simulate flame) 
// const flameGeometry = new THREE.SphereGeometry(0.09, 16, 16); // The flame is represented as a small sphere 
// const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 }); // flame is given a red-orange color
// const flame = new THREE.Mesh(flameGeometry, flameMaterial); // create a flame using the flamegeometry and flameMaterial
// flame.position.y = 0.5; // flame's position is set above the candle
// scene.add(flame);
// flame.visible = false;  // Start with the flame off

// camera.position.z = 2; // moves the camera 2 units away from the origin along the Z-axis. Camera is like the lens through which the user sees everything

// // Function to render the scene which is updated continuously
// function animate() {
//     requestAnimationFrame(animate); // ensures the animation runs smoothly
//     renderer.render(scene, camera); // renders the 3D scene from the perspective of the camera
// }
// animate();

// // Mediapipe Hands Setup
// const videoElement = document.getElementById('video');
// const hands = new Hands({locateFile: (file) => {   // hand tracking model files are loaded using locateFile
//   return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;  
// }});   // detecting hand landmarks from the video feed 

// hands.setOptions({
//     maxNumHands: 1,
//     modelComplexity: 1,
//     minDetectionConfidence: 0.7,
//     minTrackingConfidence: 0.7
// }); // Options are set for maximum number of hands to track

// hands.onResults(onResults); // This function is called every time a new frame with hand landmarks is detected

// const cameraElement = new Camera(videoElement, {   // Camera object captures video from your webcam, feeding it into the Mediapipe hands model via hands.send(). 
//     onFrame: async () => {
//         await hands.send({image: videoElement});
//     },
//     width: 640,
//     height: 480
// });
// cameraElement.start();

// // Variables to control flame state
// let isLit = false; // keeps track of whether the flame is currently lit or not.

// // Handling hand gestures
// function onResults(results) {
//     if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
//         return;  // No hands detected, so exit early
//     }

//     // Get hand landmarks
//     const landmarks = results.multiHandLandmarks[0];

//     if (landmarks.length < 10) {
//         return;  // If there are fewer than 10 landmarks, exit to avoid errors
//     }

//     // Lighting gesture: Hand is close to the candle
//     if (isCloseToCandle(landmarks)) { // // If the hand is close to the candle, then the flame is visible
//         if (!isLit) {
//             flame.visible = true;
//             isLit = true;
//         }
//     }

//     // Blowing gesture: Open hand close to the flame
//     if (isBlowingGesture(landmarks)) { // If an open-hand gesture is detected, then the flame is invisible
//         if (isLit) {
//             flame.visible = false;
//             isLit = false;
//         }
//     }
// }

// // Function to detect if hand is close to the candle (simplified logic)
// function isCloseToCandle(landmarks) { 
//     const yHand = landmarks[9].y; // The y position of index finger middle joint
//     return yHand > 1;  // Adjust based on your camera setup. It indicates the hand is near the candle.
// }

// // Function to detect blowing gesture (open hand gesture logic)
// function isBlowingGesture(landmarks) {
//     const thumbIndexDistance = distance(landmarks[4], landmarks[8]); // Detects if the hand is open by calculating the distance between the thumb (landmarks[4]) and index finger (landmarks[8]).
//     return thumbIndexDistance > 0.2;  // A more open hand
// }

// // Helper to calculate distance between two points
// function distance(point1, point2) {
//     const dx = point1.x - point2.x;
//     const dy = point1.y - point2.y;
//     const dz = point1.z - point2.z;
//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
// }

// Set up the Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a basic candle model (Cylinder)
const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
const candleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const candle = new THREE.Mesh(candleGeometry, candleMaterial);
scene.add(candle);

// Add a flame (Sphere that we'll scale to simulate flame)
const flameGeometry = new THREE.SphereGeometry(0.09, 16, 16);
const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
const flame = new THREE.Mesh(flameGeometry, flameMaterial);
flame.position.y = 0.5;
scene.add(flame);
flame.visible = false;  // Start with the flame off

camera.position.z = 2;

// Function to render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Access the webcam feed
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        video.srcObject = stream;
        video.play();

        // Create a video texture from the webcam feed
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        // Create a plane to hold the video feed
        const videoGeometry = new THREE.PlaneGeometry(16, 9);
        const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);

        // Scale the plane to fill the screen
        videoPlane.scale.set(1.5, 1.5, 1);
        scene.add(videoPlane);
        videoPlane.position.z = -5; // Position the plane behind the candle and flame
    })
    .catch(function (err) {
        console.error("Error accessing the webcam: ", err);
    });

// Mediapipe Hands Setup
const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

const cameraElement = new Camera(video, {
    onFrame: async () => {
        await hands.send({image: video});
    },
    width: 640,
    height: 480
});
cameraElement.start();

// Variables to control flame state
let isLit = false;

// Handling hand gestures
function onResults(results) {
    if (!results.multiHandLandmarks) {
        return;
    }

    // Get hand landmarks
    const landmarks = results.multiHandLandmarks[0];

    if (isCloseToCandle(landmarks)) {
        if (!isLit) {
            flame.visible = true;
            isLit = true;
        }
    }

    if (isBlowingGesture(landmarks)) {
        if (isLit) {
            flame.visible = false;
            isLit = false;
        }
    }
}

// Function to detect if hand is close to the candle
function isCloseToCandle(landmarks) {
    const yHand = landmarks[9].y;
    return yHand > 0.3;
}

// Function to detect blowing gesture
function isBlowingGesture(landmarks) {
    const thumbIndexDistance = distance(landmarks[4], landmarks[8]);
    return thumbIndexDistance > 0.1;
}

// Helper to calculate distance between two points
function distance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
