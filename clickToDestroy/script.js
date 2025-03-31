// Import Matter.js
const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent' // Make the canvas background transparent
    }
});

// Adjust canvas styling to overlay the document
render.canvas.style.position = 'absolute';
render.canvas.style.top = '0';
render.canvas.style.left = '0';
render.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
Render.run(render);
Runner.run(Runner.create(), engine);

// Add ground and walls
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
    isStatic: true
});
const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, {
    isStatic: true
});
const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, {
    isStatic: true
});

// Add the ground and walls to the world
World.add(world, [ground, leftWall, rightWall]);

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

// Make all clickable elements fall on click
document.querySelectorAll('a, button:not(#boom)').forEach(element => {
    element.addEventListener('click', (event) => {
        event.preventDefault();

        // Get the element's position and dimensions
        makeElementBouncy(element);
    });
});

document.getElementById('boom').addEventListener('click', () => {
    const h1 = document.querySelector('h1'); // Select the <h1> element
    if (!h1) return; // Exit if no <h1> is found

    // Break the <h1> text into individual characters
    const characters = h1.textContent.split('');
    h1.textContent = ''; // Clear the original text

    characters.forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block'; // Make each character block-level for positioning
        h1.appendChild(span);

        makeElementBouncy(span);
    });
});

function makeElementBouncy(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    html2canvas(element).then(canvas => {
        const texture = canvas.toDataURL(); // Convert the canvas to a data URL (image)

        // Create a physics body for the character
        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
            restitution: 0.8, // Makes it bouncy
            render: {
                sprite: {
                    texture: texture, // Use the captured image as the texture
                    xScale: rect.width / canvas.width, // Scale the texture to match the character's width
                    yScale: rect.height / canvas.height // Scale the texture to match the character's height
                }
            }
        });

        // Add random velocity and angular velocity
        const randomX = (Math.random() - 0.5) * 10; // Random horizontal velocity
        const randomY = -Math.random() * 10; // Random upward velocity
        const randomAngular = (Math.random() - 0.5) * 0.1; // Random spin
        Matter.Body.setVelocity(body, { x: randomX, y: randomY });
        Matter.Body.setAngularVelocity(body, randomAngular);

        // Add the body to the world
        World.add(world, body);

        // Remove the character from the DOM
        element.style.display = 'none';
    });
}