const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//job-book
// JFvMk88sWRZCq0SH



const uri = "mongodb+srv://job-book:JFvMk88sWRZCq0SH@cluster0.rl5ffdh.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const jobCollection = client.db('jobBookDB').collection('job');

    app.get('/job', async(req, res)=>{
        const cursor = jobCollection.find();
        const result = await cursor.toArray();
        res.send(result);
        console.log(result)
      })

      app.get('/job/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const job = await jobCollection.findOne(query);
        res.send(job);
      })

      app.post('/job', async(req, res)=>{
        const job = req.body;
        console.log(job);
        const result = await jobCollection.insertOne(job)
        res.send(result)
        
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Working');
})

app.listen(port,()=>{
    console.log(`Server is running at : ${port}`);
})