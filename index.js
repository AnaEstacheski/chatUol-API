import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import cors from "cors";
import { MongoClient } from "mongodb";

const participantSchema = joi.object({
    name: joi.string().required().min(2),
});

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private_message").required(),
});

const app = express();

// Configs

dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

// Top-Level Await

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err)
}
const db = mongoClient.db("batepapouol");

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