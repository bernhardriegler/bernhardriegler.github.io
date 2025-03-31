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
        background: '#f0f0f0'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Add ground
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
    isStatic: true
});
World.add(world, ground);

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
document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('click', (event) => {
        event.preventDefault();

        // Get the element's position
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Create a physics body for the element
        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
            restitution: 0.8, // Makes it bouncy
            render: {
                sprite: {
                    texture: '', // Optional: Add a texture if you want to keep the element's appearance
                    xScale: 1,
                    yScale: 1
                }
            }
        });

        // Add the body to the world
        World.add(world, body);

        // Remove the element from the DOM
        element.style.display = 'none';
    });
});