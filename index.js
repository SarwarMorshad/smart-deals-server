const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// smartDealsDB
// L6QeErbgOLfh0DTW
const uri = "mongodb+srv://smartDealsDB:L6QeErbgOLfh0DTW@cluster0.cjj6frc.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Welcome to the Smart Deals API!");
});

async function run() {
  try {
    await client.connect();

    const database = client.db("smartDealsDB");
    const ProductsCollection = database.collection("products");
    const bidsCollection = database.collection("bids");
    const usersCollection = database.collection("users");

    // Users API
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // Products APIs
    // GET API
    app.get("/products", async (req, res) => {
      const cursor = ProductsCollection.find();
      const results = await cursor.toArray();
      res.send(results);
    });

    // Latest Products API
    app.get("/latestProducts", async (req, res) => {
      const cursor = ProductsCollection.find().sort({ created_at: -1 }).limit(6);
      const results = await cursor.toArray();
      res.send(results);
    });

    // GET Single Product API
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductsCollection.findOne(query);
      res.send(result);
    });

    // POST API
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await ProductsCollection.insertOne(newProduct);
      res.send(result);
    });

    // PATCH API
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedProduct = req.body;
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const result = await ProductsCollection.updateOne(query, update);
      res.send(result);
    });

    // DELETE API
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductsCollection.deleteOne(query);
      res.send(result);
    });

    // bids API
    // get all bids
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const results = await cursor.toArray();
      res.send(results);
    });

    // get all bid by product
    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      const cursor = bidsCollection.find(query);
      const results = await cursor.toArray();
      res.send(results);
    });
    // post a bid
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart Deals Server is running on http://localhost:${port}`);
});
