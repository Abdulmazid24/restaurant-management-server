const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rne0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db('restaurantDB');
    const foodsCollection = db.collection('foods');
    const purchasesCollection = db.collection('purchases');
    app.get('/foods', async (req, res) => {
      try {
        const result = await foodsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    app.get('/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: 'Food not found' });
        }
        res.send(result);
      } catch (error) {
        console.error('Error fetching food by ID:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    // save purchase data in db
    app.post('/purchase', async (req, res) => {
      try {
        const order = req.body;
        const result = await purchasesCollection.insertOne(order);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to process purchase' });
      }
    });

    // get all foods bought a specific user
    app.get('/myfoods/:email', async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const result = await purchasesCollection.find(query).toArray();
      res.send(result);
    });

    // delete a food from db
    app.delete('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchasesCollection.deleteOne(query);
      res.send(result);
    });

    // get a single food purchase data by id from db
    app.get('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchasesCollection.findOne(query);
      res.send(result);
    });

    // Update a single food purchase data by in the db
    app.put('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const foodData = req.body;
      const updated = {
        $set: foodData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await purchasesCollection.updateOne(
        query,
        updated,
        options
      );
      res.send(result);
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Restaurant management Server started');
});

app.listen(port, () => {
  console.log(`Restaurant management server site is running at ${port}`);
});
