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
    app.get('/top-foods', async (req, res) => {
      try {
        const topFoods = await foodsCollection
          .find()
          .sort({ purchaseCounts: -1 }) // Correct order: DESCENDING
          .limit(6)
          .toArray();

        res.json(topFoods);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top foods' });
      }
    });

    app.get('/foods', async (req, res) => {
      try {
        const search = req.query.search || ''; // Ensure search is always a string
        console.log('Search Query:', search);

        let query = {};
        if (search) {
          query = {
            name: {
              $regex: search,
              $options: 'i',
            },
          };
        }

        const result = await foodsCollection.find(query).toArray();
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
        // save data in purchaseCollection
        const order = req.body;
        const result = await purchasesCollection.insertOne(order);
        // Increase purchase Count in foods collection
        const filter = { _id: new ObjectId(order.foodId) };
        const update = {
          $inc: { purchaseCount: 1 },
        };
        const updatePurchaseCount = await foodsCollection.updateOne(
          filter,
          update
        );
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to process purchase' });
      }
    });

    // get all foods added a specific user
    app.get('/myfoods/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    // get a single food purchase data by id from db
    app.get('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    // **POST Route: Add a New Food Item**
    app.post('/add-foods', async (req, res) => {
      try {
        console.log('Received food item:', req.body); // Debugging line
        const foodItem = req.body;
        const result = await foodsCollection.insertOne(foodItem);
        console.log('Insert result:', result); // Debugging line
        res.status(201).send(result);
      } catch (error) {
        console.error('Error adding food:', error); // Debugging line
        res.status(500).send({ error: 'Failed to add food item' });
      }
    });

    // Update a single food that Added a logged in user
    app.put('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const foodData = req.body;
      const updated = {
        $set: foodData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await foodsCollection.updateOne(query, updated, options);
      res.send(result);
    });

    // get all foods ordered by a logged in user
    app.get('/my-orders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const result = await purchasesCollection.find(query).toArray();
      res.send(result);
    });

    // delete a food from db
    app.delete('/my-orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchasesCollection.deleteOne(query);
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
