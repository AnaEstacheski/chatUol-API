import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const app = express();
dotenv.config();
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

// Top-Level Await

try {
    await mongoClient.connect()
} catch(err) {
    console.log(err)
}
let db = mongoClient.db("batepapouol");

//  Routes

app.get('/participants', async (req, res) => {

});

app.post('/participants', async (req, res) => {

});

//

app.get('/messages', async (req, res) => {

});

app.post('/messages', async (req, res) => {

});

//

app.post('/status', async (req, res) => {

})

//

app.listen(process.env.PORT, () =>
    console.log(`App running in port: ${process.env.PORT}`)
);