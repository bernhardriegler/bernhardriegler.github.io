# Product Requirements Document

## Overview
This document outlines the current features and requirements for the game "Farmer Joe," inspired by Doodle Jump. It serves as a reference for future feature expansions and improvements.

## Core Features
- Two-player support:
  - Player 1 (Farmer Joe) uses arrow keys.
  - Player 2 (Ann) uses W, A, S, D keys.
- Both players can move, harvest berries, use machines, deliver berries/crates, and unlock rewards.
- Shared resource pool for berries and points; all actions affect the shared pool.
- Berry field (top right):
  - First berry spawns immediately; new berries spawn every 10 seconds.
  - Harvesting: Stand on a berry for 2 seconds (progress bar shown above player) to collect it.
- Table (above NPCs at bottom):
  - Deliver berries or crates here for points.
- NPCs (bottom):
  - Each NPC displays a visible berry need (1-10).
  - NPCs queue for berries; only the first in line collects until fulfilled, then leaves and respawns after exiting screen.
- Machines (up to 3 unlockable):
  - Unlock for 100 points each at the reward area (top left).
  - Placed in the top center; either player can use 2 berries to start crate production (5s, with progress bar).
  - Crates can be picked up and delivered; each crate counts as 3 berries when delivered.
- Points system:
  - 10 points per berry delivered.
  - Crates multiply berry value (2 berries in, 3 berries out).
- Rewards area (top left):
  - Exchange points for rewards (including unlocking machines).
  - Visual reward notifications (shaky message + fireworks) instead of alerts.
- UI:
  - Shared pool of berries and points displayed.
  - Crate status shown if a player is carrying one.
  - Progress bars for harvesting and machine use.
- Visuals:
  - Distinct map areas: green ground, brown/striped berry field, table, NPC area, machines, and reward area.
  - Animated, non-blocking notifications for rewards.
- Extensible codebase and clear documentation for future improvements.

## Current Implementation State
- Fully playable in browser (HTML5 canvas).
- All features above are implemented and tested.
- Code and requirements are up to date and ready for further extension or polish.