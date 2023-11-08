const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}



//
const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token;
  console.log(token)
  // console.log('token in the middleware', token);
  // no token available 
  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
      if(err){
          return res.status(401).send({message: 'unauthorized access'})
      }
      console.log('Decoded Token:', decoded);
      req.user = decoded;
      next();
  })
}

async function run() {
  try {

    const jobCollection = client.db('jobBookDB').collection('job');
    const bidCollection = client.db('jobBookDB').collection('bids');


    
    // Auth realted API
    app.post('/jwt', logger, async(req, res) => {
      const user = req.body;
      // console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      // console.log(token)
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
        
      })
      .send({success: true})
    })

    app.post('/logout', async(req, res)=>{
      const user = req.body;
      res.clearCookie('token', {maxAge: 0}).send({success: true})
    })

    // Service related API
    app.get('/job', async(req, res)=>{
        const cursor = jobCollection.find();
        // console.log('tok tok token', req.cookies.token)
        const result = await cursor.toArray();
        res.send(result);
        console.log(result)
      })

      // 
      app.get('/job/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const job = await jobCollection.findOne(query);
        res.send(job);
      })

      // 
      app.post('/job', async(req, res)=>{
        const job = req.body;
        // console.log(job);
        const result = await jobCollection.insertOne(job)
        res.send(result)
        
    })
    

    // 
    app.post('/bidjob', async(req, res)=>{
      const job = req.body;
      // console.log(job);
      const result = await bidCollection.insertOne(job)
      res.send(result)
      
    })
    
    
    // 
    app.get('/bidjob', logger, 
    verifyToken, 
    async(req, res)=>{
      const cursor = bidCollection.find();
      const result = await cursor.toArray();
      console.log(req.query.email , req.user)
      // res.send(result);
      console.log('cooooookis', req.cookies)
    //   if(req.query.email !== req.user.email){
    //     return res.status(403).send({message: 'forbidden access'})
    // }

    let query = {};
    if (req.query?.email) {
      query = {
        $or: [
            { buyerEmail: req.query.email },
            { email: req.query.email }
        ]
    };
    }
    const result2 = await bidCollection.find(query).toArray();
    res.send(result2);
    console.log(result2)
    })

    

    app.delete('/job/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })
    

    app.put('/job/:id', async(req, res)=>{
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const product = {
        $set:{
          jobTitle: updateProduct.jobTitle, 
          deadline: updateProduct.deadline, 
          category: updateProduct.category, 
          minPrice: updateProduct.minPrice, 
          maxPrice: updateProduct.maxPrice, 
          description: updateProduct.description, 
        }
      }
      const result = await jobCollection.updateOne(filter, product, options);

      res.send(result);
    })
    app.put('/bidjob/:id', async(req, res)=>{
      const id = req.params.id;
      const updateJob = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const job = {
        $set:{
          status: updateJob.status,
        }
      }
      const result = await bidCollection.updateOne(filter, job, options);

      res.send(result);
    })

    


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