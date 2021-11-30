import * as amqp from 'amqplib';

let amqpClient: amqp.Channel = null;

export const directExchangeName = 'route.fanout.exchange';

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  amqpClient = await connection.createChannel();
  amqpClient.assertExchange(directExchangeName, 'direct', {
    durable: true,
  });
  console.log('RabbitMQ connection done');
};

export { amqpClient };
