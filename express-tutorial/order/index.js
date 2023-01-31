import amqplib from "amqplib";
import express from "express";

const app = express();

// parse the request body
app.use(express.json());

// port where the service will run
const PORT = 9005;

// rabbitmq to be global variables
let channel, connection;

connect();

// connect to rabbitmq
async function connect() {
  try {
    // rabbitmq default port is 5672
    const amqpServer = "amqp://localhost";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue("order");
  } catch (error) {
    console.log(error);
  }
}

app.post("/orders", (req, res) => {
  const data = req.body;
  console.log("Msg ---> ", data);

  // send a message to all the services connected to 'order' queue, add the date to differentiate between them
  channel.sendToQueue(
    "order",
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );

  res.send("Order submitted");
});

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
