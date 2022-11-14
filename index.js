import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import cors from "cors";
import dayjs from "dayjs";
import { MongoClient } from "mongodb";

const participantSchema = joi.object({
    name: joi.string().required().trim().min(2),
});

const messageSchema = joi.object({
    to: joi.string().required().trim(),
    text: joi.string().required().trim(),
    type: joi.string().trim().valid("message", "private_message").required(),
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

app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch (err) {
        res.sendStatus(400);
    }
});

app.post("/participants", async (req, res) => {
    const participant = req.body;
    const validation = participantSchema.validate(participant, {
        abortEarly: false,
    });

    if (validation.error) {
        const error = validation.error.details.map((detail) => detail.message);
        res.status(422).send(error);
        return;
    }

    const newParticipant = {
        name: participant.name,
        lastStatus: Date.now()
    };
    const newStatus = {
        from: participant.name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().format("HH:mm:ss"),
    };

    try {
        const invalidUserName = await db
            .collection("participants")
            .findOne({ name: participant.name })
        if (invalidUserName) {
            res
                .status(409)
                .send("invalid username");
            return;
        }
        await db.collection("participants")
            .insertOne(newParticipant);

        await db.collection("messages")
            .insertOne(newStatus);
        res.sendStatus(201);
    } catch (err) {
        res.sendStatus(400);
    }
});

//

app.get("/messages", async (req, res) => {
    
});

app.post("/messages", async (req, res) => {

});

//

app.post("/status", async (req, res) => {

})

//

app.listen(process.env.PORT, () =>
    console.log(`App running in port: ${process.env.PORT}`)
);