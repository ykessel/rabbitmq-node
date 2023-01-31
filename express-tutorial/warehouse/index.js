import amqplib from "amqplib";
import express from "express";

const app = express();

// parse the request body
app.use(express.json());

// port where the service will run
const PORT = 9006;

// rabbitmq to be global variables
let channel, connection;

connect();

async function connect() {
  try {
    const amqpServer = "amqp://localhost";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // consume all the orders that are not acknowledged
    await channel.consume("order", (data) => {
      console.log(`Received ${Buffer.from(data.content)}`);
      channel.ack(data);
    });
  } catch (error) {
    console.log(error);
  }
}

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
