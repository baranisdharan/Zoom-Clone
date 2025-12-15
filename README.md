# Zoom Clone with NestJS

A video conferencing application built with NestJS, Socket.IO, and WebRTC.

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

```bash
npm install
```

## Running the Application

### Development Mode

You need to run two servers:

**Terminal 1: Start PeerJS Server**
```bash
npx peerjs --port 3001
```

**Terminal 2: Start NestJS Application**
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

### Production Mode

**Build the application:**
```bash
npm run build
```

**Terminal 1: Start PeerJS Server**
```bash
npx peerjs --port 3001
```

**Terminal 2: Run the built application**
```bash
npm run start:prod
```

## How It Works

1. Navigate to `http://localhost:3000` - you'll be redirected to a random room
2. Share the URL with others to join the same room
3. Grant camera and microphone permissions when prompted
4. Your video stream will appear along with other participants

## Architecture

- **Backend**: NestJS with Socket.IO WebSocket Gateway
- **WebRTC Signaling**: PeerJS server (port 3001)
- **Frontend**: Vanilla JavaScript with PeerJS client
- **View Engine**: EJS templating

## Project Structure

```
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # HTTP route controllers
│   ├── app.service.ts             # Application services
│   └── events/
│       ├── events.gateway.ts      # WebSocket gateway
│       └── events.module.ts       # Events module
├── public/
│   └── script.js                  # Frontend WebRTC logic
├── views/
│   └── room.ejs                   # Room template
└── package.json
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with auto-reload
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code

## Technologies

- **NestJS** - Progressive Node.js framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **WebRTC** - Peer-to-peer video/audio streaming
- **PeerJS** - Simplified peer-to-peer connections
- **TypeScript** - Typed JavaScript
- **EJS** - Templating engine
