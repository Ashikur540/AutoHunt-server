
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.port || 5000
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.6vknfdj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);



// load all appointments data
const DBConnect = async () => {
    try {
        client.connect();
        console.log("success connection");
    } catch (error) {
        console.log(error.message);
    }
}

DBConnect();

// -------------------------collections---------------------------------
const usersCollection = client.db('AutoHunt').collection('users');
const carsCollection = client.db('AutoHunt').collection('cars');
const categoryCollection = client.db('AutoHunt').collection('category');
const carPurchaseCollection = client.db('AutoHunt').collection('purchase');






/* ################MY MiddleWares  ########################*/






/* ################MY MiddleWares  ########################*/





/* ################MY get   ########################*/
// load all cars  based on company
app.get('/cars', async (req, res) => {
    const { category_name } = req.query;
    // console.log(category_name);
    const result = await carsCollection.find({ category_name: category_name }).toArray();

    res.send(result)
})

// category load
app.get('/category', async (req, res) => {
    const result = await categoryCollection.find({}).toArray();
    res.send(result);
})

// get purchaselist through email
app.get('/myPurchaseList', async (req, res) => {
    const { email } = req.query;
    // console.log(qey);
    const query = { buyerEmail: email };
    const result = await carPurchaseCollection.find(query).toArray();
    res.send(result);
})

// get all users through email
app.get('/users', async (req, res) => {

    const result = await usersCollection.find({}).toArray();
    res.send(result);
})




/* ################MY get  ########################*/








/* ################MY post   ########################*/

app.post('/user', async (req, res) => {
    const userInfo = req.body;
    const result = await usersCollection.insertOne(userInfo);
    res.send(result)
})
app.post('/purchase', async (req, res) => {
    const purchaseInfo = req.body;
    const result = await carPurchaseCollection.insertOne(purchaseInfo);
    res.send(result);
})
// add cars
app.post('/cars/add', async (req, res) => {
    const carInfo = req.body;
    const result = await carsCollection.insertOne(carInfo);
    res.send(result)
})



/* ################MY post  ########################*/













// -------------------test-----------------------------

app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Autohunt server server is running.."
    })
})



app.listen(port, () => {
    console.log("server is running in ", port || 5000);
})