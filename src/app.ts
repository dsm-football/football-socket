import * as express from 'express';
import * as cors from 'cors';
import { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { Server as IO } from 'socket.io';
import router from './routes';
import { ApiNotFoundError } from './error/errorCode';
import { errorHandler } from './middleware/errorHandler';
import socketInit from './socket/index';

class App {
  private app: Application;
  private httpServer: Server;
  private io: IO;

  constructor() {
    this.createApp();
  }

  private createApp(): void {
    this.app = express.default();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors.default());

    this.app.use('/', router);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(ApiNotFoundError);
    });

    this.app.use(errorHandler);
  }

  private createServer(port: number): void {
    this.httpServer = createServer(this.app);
    this.httpServer.listen(port);
  }

  private socket() {
    this.io = require('socket.io')(this.httpServer, { origin: '*:*' });
    socketInit(this.io);
  }

  public listen(port: number, callback: () => void) {
    this.createServer(port);
    this.socket();
    callback();
  }
}

export default new App();
