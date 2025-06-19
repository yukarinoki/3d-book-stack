# CLAUDE.md

必ず日本語で回答すること
実装が終わったらnpm run buildを必ずしてエラーが出ないことを確認すること。
言われたことだけをしろ、コードを勝手に書き換えるな。
デバッグ出力を勝手に消すな

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D book visualization application built with React, TypeScript, and Three.js. It renders interactive 3D books with physics simulation capabilities using React Three Fiber and Rapier physics engine.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Architecture

The application uses:

- **React Three Fiber** (@react-three/fiber) for 3D rendering
- **Drei** (@react-three/drei) for Three.js utilities
- **Rapier** (@react-three/rapier) for physics simulation
- **Leva** for runtime GUI controls
- **Vite** as the build tool
- **TypeScript** for type safety

Main components:

- `src/App.tsx`: Contains the main scene setup and the Book component that renders 3D book meshes with configurable dimensions and binding types (paperback/hardcover)
- Physics simulation can be toggled on/off, allowing books to drop and interact with a floor plane
- All dimensions are specified in millimeters and converted to meters for the physics engine
