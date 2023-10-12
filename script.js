const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null, isInside: false };

let mouseTrail = []; // Array to store mouse positions
const trailLength = 10; // Number of positions to store

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;

    // Add the current mouse position to the beginning of the array
    mouseTrail.unshift({ x: mouse.x, y: mouse.y });

    // Remove the oldest mouse position if the array is too long
    if (mouseTrail.length > trailLength) {
        mouseTrail.pop();
    }
});

canvas.addEventListener('mouseover', () => {
    mouse.isInside = true;
});

canvas.addEventListener('mouseout', () => {
    mouse.isInside = false;
    mouseTrail = []; // Clear the mouse trail when the mouse leaves the canvas
});

window.addEventListener('mousedown', () => {
    mouse.isPressed = true;
});

window.addEventListener('mouseup', () => {
    mouse.isPressed = false;
});



class Ball {
    constructor(x, y, radius, r, g, b, dx, dy, friction) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.dx = dx;
        this.dy = dy;
        this.friction = friction
        this.isColliding = false;
        
        this.cr = 32;
        this.cg = 32;
        this.cb = 32;
        this.br = r;
        this.bg = g;
        this.bb = b;

        this.frictionInterval = 500; // Interval time for friction to apply, in milliseconds
        this.lastFrictionTime = Date.now(); // Last time when friction was applied
    }

    checkCollision() {
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.dx = -this.dx;
            this.isColliding = true;
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.dy = -this.dy;
            this.isColliding = true;
        }
    }

    updateColor() {
        if (this.isColliding) {
            this.cr = this.br;
            this.cg = this.bg;
            this.cb = this.bb;
            this.isColliding = false;
        } else {
            this.cr = Math.max(32, this.cr - 1);
            this.cg = Math.max(32, this.cg - 1);
            this.cb = Math.max(32, this.cb - 1);
        }
    }

    attract() {
        if (!mouse.isInside || mouse.x === null || mouse.y === null) return;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const minDistance = 75;  // Minimum distance for attraction to start
        const maxDistance = 150; // Maximum distance for attraction to work

        if (distance > minDistance && distance < maxDistance) {
            var force = 0.1 / distance;
            if (mouse.isPressed) {
                force = 2.0 / distance;
            }
            const forceDirection = mouse.isPressed ? -1 : 1;

            this.dx = Math.min(this.dx + dx * force * forceDirection, 4.0);
            this.dy = Math.min(this.dy + dy * force * forceDirection, 4.0);
        }
    }

    applyFriction() {
        var currentTime = Date.now();
        // Check if it's time to apply friction
        if (currentTime - this.lastFrictionTime >= this.frictionInterval) {
            this.dx *= this.friction;
            this.dy *= this.friction;
            this.lastFrictionTime = currentTime; // Update the last friction time
        }
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        this.checkCollision();
        this.updateColor();

        this.attract(); // Add attraction to the move method
        this.applyFriction(); // Add friction to the move method
    }

    draw() {
        // Draw a blurred shadow behind the ball
        ctx.filter = 'blur(10px)'; // Adjust the blur value as needed
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.cr}, ${this.cg}, ${this.cb}, 0.7)`; // Semi-transparent color
        ctx.fill();
        ctx.closePath();

        // Draw the actual ball without blur
        ctx.filter = 'none';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${this.cr}, ${this.cg}, ${this.cb})`;
        ctx.fill();
        ctx.closePath();
    }
}

// Generate random balls
var balls = [];
var numBalls = 20;

for (let i = 0; i < numBalls; i++) {
    var x = Math.random() * (canvas.width - 2 * radius) + radius; // Random x position
    var y = Math.random() * (canvas.height - 2 * radius) + radius; // Random y position
    var radius = Math.random() * 20 + 5; // Random radius between 5 and 25

    var r = Math.random() * 100 + 155;
    var g = Math.random() * 100 + 155;
    var b = Math.random() * 100 + 155;

    var dx = (Math.random() - 0.5) * 10; // Random dx between -5 and 5
    var dy = (Math.random() - 0.5) * 10; // Random dy between -5 and 5

    balls.push(new Ball(x, y, radius, r, g, b, dx, dy, 1.0 - radius * 0.075 / 25.0));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.draw();
        ball.move();
    });

    // Draw the mouse trail
    ctx.beginPath();
    mouseTrail.forEach((point, index) => {
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(128, 128, 128, ${1 - index / trailLength})`; // Fade out the tail
        ctx.lineWidth = 5; // Adjust the line width as needed
        ctx.stroke();
    });
    ctx.closePath();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    balls.forEach(ball => {
        ball.x = Math.min(ball.x, canvas.width - ball.radius);
        ball.y = Math.min(ball.y, canvas.height - ball.radius);
    });
});

animate();
