// Importing necessary libraries, configs, mongoDB course model
import express from 'express';

// Initializing express app
const app = express();

const PORT = 5555;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});