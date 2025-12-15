import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ExpressPeerServer } from 'peer';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Serve static files from public directory
    app.useStaticAssets(join(__dirname, '..', 'public'));

    // Get the underlying HTTP server BEFORE setting up PeerJS
    const httpAdapter = app.getHttpAdapter();
    const httpServer = httpAdapter.getHttpServer();

    // Set up PeerJS server BEFORE app.listen()
    const peerServer = ExpressPeerServer(httpServer, {
        path: '/',
    });

    // Mount PeerJS at /peerjs
    app.use('/peerjs', peerServer);

    peerServer.on('connection', (client) => {
        console.log(`[PeerJS] Client connected: ${client.getId()}`);
    });

    peerServer.on('disconnect', (client) => {
        console.log(`[PeerJS] Client disconnected: ${client.getId()}`);
    });

    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000');
    console.log('PeerJS server is running on: http://localhost:3000/peerjs');
}
bootstrap();
