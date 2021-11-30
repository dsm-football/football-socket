import express from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes';
import { ApiNotFoundError } from './error/errorCode';
import { errorHandler } from './middleware/errorHandler';
import { createConnection } from 'typeorm';
import option from './config/ormconfig';
import { connectRabbitMQ } from './config/rabbitmq';
import { serverPort } from './config/secret';
import { Server } from 'socket.io';
import SocketInit from './socket/socketInit';
const app: Application = express();

createConnection(option)
  .then(async () => {
    await connectRabbitMQ();
  })
  .catch(console.error);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', router);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(ApiNotFoundError);
});
app.use(errorHandler);

const server = app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
  socketServer();
});

const socketServer = () => {
  const socketApp = new SocketInit();
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });
  socketApp.start(io);
};
