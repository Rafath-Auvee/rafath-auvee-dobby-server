const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.user}:${process.env.password}@cluster0.tyhuq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access." });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const photoCollection = client.db("Rafath-Dobby").collection("Photos");

    app.get("/photos", async (req, res) => {
      const products = await photoCollection.find().toArray();
      res.send(products);
    });
    // verifyJWT,
    app.post("/photos", async (req, res) => {
      const product = req.body;
      const products = await photoCollection.insertOne(product);
      res.send(products);
    });
    app.get("/photos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await photoCollection.findOne(query);
      res.send(product);
    });
    app.put("/photos/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = req.body.parseTotalQ;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { quantity: quantity },
      };
      const product = await photoCollection.updateOne(filter, updateDoc);
      res.send(product);
    });
    app.get("/myphotos", async (req, res) => {
      console.log("query", req.query);
      const email = req.query.email;
      const query = { email: email };
      console.log("email", email);
      console.log("query:", query);
      const cursor = photoCollection.find(query);
      let products;
      products = await cursor.toArray();
      res.send(products);
      // console.log(products)
    });
    // verifyJWT,
    app.delete("/photos/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { id: ObjectId(id) };
      const result = await photoCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is working ${port}`);
});
