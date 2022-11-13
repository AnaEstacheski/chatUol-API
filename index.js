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




app.listen(process.env.PORT, () =>
    console.log(`App running in port: ${process.env.PORT}`)
);