# Doodle Jump PvP

Doodle Jump PvP is a multiplayer game inspired by the classic Doodle Jump. Two players can compete simultaneously, navigating platforms, collecting power-ups, and blocking each other to gain the upper hand.

## Features
- **Player Movement**: Players can move left and right using keyboard controls.
- **Jumping Mechanic**: Players automatically jump when landing on platforms.
- **Gravity**: Players are affected by gravity, pulling them downward.
- **Platforms**: Static platforms are generated dynamically as players move upward.
- **Power-ups**: Players can collect glowing orbs to choose from various upgrades, such as a jetpack for higher jumps.
- **Multiplayer Mode**: Two players can play together, with collision detection allowing them to block each other.
- **Game Over Screen**: A game-over screen is displayed when a player falls off the screen, with an option to restart.

## Development
This project was generated with GitHub Copilot using the requirements outlined in the [`productRequirementFile.md`](src/productRequirementFile.md). The document served as the foundation for implementing the game's features and mechanics.

## Getting Started
To run the project locally:
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open the game in your browser at `http://localhost:5173`.

## Build
To build the project for production:
```sh
npm run build
```

## Preview
To preview the production build:
```sh
npm run preview
```

## License
This project is licensed under the [`MIT License`](LICENSE.txt).