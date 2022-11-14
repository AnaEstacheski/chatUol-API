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
        abortEarly: false
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
            res.status(409).send("invalid username");
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
    const { limit } = req.query;
    const { user } = req.headers;

    try {
        const messages = await db.collection("messages")
            .find()
            .toArray();
        const filterMessage = messages.filter(
            (el) =>
                el.from === user ||
                el.to === user ||
                el.type === "message" ||
                el.type === "status",
        );
        if (limit) {
            res.send(filterMessage.slice(-limit))
            return;
        } res.send(filterMessage)
    } catch (err) {
        console.log(err)
        res.sendStatus(400);
    }
});

app.post("/messages", async (req, res) => {
    const message = req.body;
    const user = req.headers.user;
    const validation = messageSchema.validate(message, { abortEarly: false });
    if (validation.error) {
        const error = validation.error.details.map((detail) => detail.message);
        res.status(422).send(error);
        return;
    }

    const newMessage = {
        from: user,
        to: message.to,
        text: message.text,
        type: message.type,
        time: dayjs().format("HH:mm:ss"),
    }

    try {
        const userExists = await db
            .collection("participants")
            .findOne({ name: user });
        if (!userExists) {
            res.sendStatus(422)
            return;
        }
        await db.collection("messages").insertOne(newMessage);
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(400);
    }
});

//

app.post("/status", async (req, res) => {
    const user = req.headers.user;
    try {
        const userExists = await db
            .collection("participants")
            .findOne({ name: user });
        if (!userExists) {
            res.sendStatus(404);
            return;
        }
        await db.collection("participants").updateOne(
            { _id: userExists._id },
            {
                $set: {
                    name: userExists.name,
                    lastStatus: Date.now(),
                },
            }
        );
        res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.sendStatus(400);
    }
})

// Remove inactive users

setInterval(removeInactiveUser, 15000);

async function removeInactiveUser() {
	try {
		const participants = await db.collection("participants")
        .find()
        .toArray();
		participants
			.filter((el) => Date.now() - el.lastStatus > 10000)
			.forEach((el) => {
				const newStatus = {
					from: el.name,
					to: "Todos",
					text: "sai da sala...",
					type: "status",
					time: dayjs().format("HH:mm:ss"),
				};

				db.collection("participants").deleteOne({ _id: el._id });
				db.collection("messages").insertOne(newStatus);
			});
	} catch (err) {
		console.log(err);
	}
}

//

app.listen(process.env.PORT, () =>
    console.log(`App running in port: ${process.env.PORT}`)
);