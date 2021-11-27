import { createConnection } from 'typeorm';
import app from './app';
import option from './config/ormconfig';
import { serverPort } from './config/secret';

createConnection(option)
  .then(() => {
    app.listen(serverPort, () =>
      console.log(`Server running on port ${serverPort}`),
    );
  })
  .catch(console.error);
