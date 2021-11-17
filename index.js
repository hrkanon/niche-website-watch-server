const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kjpcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("swissEagle");
    const productCollection = database.collection("products");
    const ordersCollection = client.db("swissEagle").collection("orders");
    const usersCollection = client.db("swissEagle").collection("users");
    const reviewCollection = client.db("swissEagle").collection("review");

    // POST API
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    // GET ALL PRODUCTS
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // GET SINGLE PRODUCT
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // ADD ORDER
    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // GET SPECIFIC ORDERS
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection
        .find({
          email: email,
        })
        .toArray();
      res.json(result);
    });

    // GET ALL ORDERS
    app.get("/allOrders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // DELETE ORDER
    app.delete("/deleteProduct/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // UPDATE ORDER
    app.put("/statusUpdate/:id", async (req, res) => {
      const updatedStatus = req.body.status;
      console.log(updatedStatus);
      const filter = { _id: ObjectId(req.params.id) };
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: updatedStatus,
        },
      });
      res.json(result);
    });

    // ADD REVIEW
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // GET REVIEW
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    // ADD USER
    app.post("/addUserInfo", async (req, res) => {
      const user = req.body;
      user.role = "user";
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/addUserInfo", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // IS ADMIN OR NOT
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // MAKE ADMIN
    app.put("/makeAdmin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.findOne(filter);
      console.log(result);
      if (result) {
        const documents = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(documents);
      } else {
        user.role = "admin";
        const resultTwo = await usersCollection.insertOne(user);
        res.send(resultTwo);
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

app.listen(port, () => {
  console.log("Running Server on port", port);
});
