let WHEEL_SCALE = 1;
let WEDGE_SCALE = .97;
let TEXT_SCALE = .85;
let NUM_WEDGES = 8;
let WEDGE_ANGLE = 2 * Math.PI / NUM_WEDGES;
let COLORS = ["#B5DFCF", "#F7B5D2", "#B19ACA", "#FFFAC2"];
let BORDER_COLOR = "white";
let ANIM_TIME = 3; // Time in seconds
let WHEEL_ACCEL = 100 // Acceleration in radians/sec^2
let BASE_WHEEL_DECEL = .1; // Deceleration in radians/sec^2
let WHEEL_ACCEL_TIME = .3; // Time in seconds
let WHEEL_DECEL_TIME = WHEEL_ACCEL_TIME - ANIM_TIME;
let FULL_ROTATIONS = 2;

var width;
var height;
var centerX;
var centerY;
var wheelRad;
var wedgeRad;
var wedgeRotation = - Math.PI / 2; // Start with the index 0 wedge facing up
var initialWedgeRotation // In radians
var finalWedgeRotation; // In radians
var spinning = false;
var lastSpunTime;
var timeSinceLastSpin = 0;

document.body.style.backgroundColor = "#66B4F0";

var canvas = document.getElementById("spinnerCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var canvasCtx = canvas.getContext("2d");
canvasCtx.font = "300% Arial";
canvasCtx.textAlign = "center";
canvasCtx.textBaseline = "middle";

var container = document.getElementById("container");
var button = document.getElementById("goButton");

window.addEventListener("resize", (event) => {
  updateDimensions();
  render();
});

mainLoop();

function spin() {
  initialWedgeRotation = wedgeRotation;
  finalWedgeRotation = Math.floor(Math.random() * NUM_WEDGES) + .5;
  finalWedgeRotation *= 2*Math.PI / NUM_WEDGES;
  spinning = true;
  // TODO: Update lastSpunTime
  timeSinceLastSpin = 0;
}

function mainLoop() {
  updateDimensions();
  updateRotation();
  render();
  timeSinceLastSpin += 1/60; // TODO: Get actual time
  requestAnimationFrame(mainLoop);
}

function updateDimensions() {
  // TODO: Use a reference
  width = canvas.width;
  height = canvas.height;

  var minDim = Math.min(width, height);
  wheelRad = minDim * WHEEL_SCALE / 2;
  wedgeRad = minDim * WEDGE_SCALE / 2;

  centerX = width / 2;
  centerY = height / 2;
}

function updateRotation() {
  let MAX_ANGULAR_VELOCITY = WHEEL_ACCEL * WHEEL_ACCEL_TIME;
  var angleSinceAcceleration = .5 * WHEEL_ACCEL * Math.pow(WHEEL_ACCEL_TIME, 2);
  let DECAY_RATE = mod(finalWedgeRotation - initialWedgeRotation, 2*Math.PI)
    - angleSinceAcceleration
    + FULL_ROTATIONS * 2*Math.PI;

  // Rotation (in radians) as a function of time
  // Approximates physically how the wheel would act
  // During the acceleration phase, there is a net push
  // During the deceleration phase, there is a net drag (from the spokes)
  function skewedSigmoid(t) {
    if (t < WHEEL_ACCEL_TIME) {
      return .5 * WHEEL_ACCEL * t*t;
    }
    if (t < ANIM_TIME) {
      var timeSinceAcceleration = t - WHEEL_ACCEL_TIME;
      return angleSinceAcceleration
        + DECAY_RATE * (1 - Math.pow(2, -timeSinceAcceleration*WHEEL_ACCEL*WHEEL_ACCEL_TIME/DECAY_RATE));
    }
    spinning = false;

    // Calculate final wedge
    let normedFinalTopAngle = mod(-finalWedgeRotation - Math.PI/2, 2*Math.PI);
    let idx = mod(Math.floor(normedFinalTopAngle / WEDGE_ANGLE), COLORS.length);
    document.body.style.backgroundColor = COLORS[idx];

    return finalWedgeRotation - initialWedgeRotation;
  }

  if (spinning) {
    wedgeRotation = skewedSigmoid(timeSinceLastSpin) + initialWedgeRotation;
  }
}

function render() {
  drawWheel();
  drawWedges();
  drawArrow();
}

function drawWheel() {
  canvasCtx.beginPath();
  canvasCtx.arc(centerX, centerY, wheelRad, 0, 2 * Math.PI);
  canvasCtx.fillStyle = BORDER_COLOR;
  canvasCtx.fill();
}

function drawWedges() {
  for (let i = 0; i < NUM_WEDGES; i++) {
    var idx = i % COLORS.length;
    var color = COLORS[idx];
    drawWedge(
      wedgeRotation + i * WEDGE_ANGLE,
      wedgeRotation + (i + 1) * WEDGE_ANGLE,
      color,
    );
  }
}

function drawWedge(startAngle, endAngle, color) {
  canvasCtx.beginPath();
  canvasCtx.moveTo(centerX, centerY);
  canvasCtx.lineTo(
    centerX + wedgeRad * Math.cos(startAngle),
    centerY + wedgeRad * Math.sin(startAngle)
  );
  canvasCtx.arc(centerX, centerY, wedgeRad, startAngle, endAngle);
  canvasCtx.fillStyle = color;
  canvasCtx.fill();
}

function drawArrow() {
  canvasCtx.beginPath();
  canvasCtx.moveTo(centerX - 20, centerY - wheelRad);
  canvasCtx.lineTo(centerX + 20, centerY - wheelRad);
  canvasCtx.lineTo(centerX, centerY - wedgeRad + 40);
  canvasCtx.fillStyle = BORDER_COLOR;
  canvasCtx.fill();
}

// % doesn't work for negative numbers
function mod(n, m) {
  return ((n % m) + m) % m;
}
