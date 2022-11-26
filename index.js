
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.port || 5000
const app = express();
const jwt = require('jsonwebtoken');
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
// verify jwt
const verifyJWT = (req, res, next) => {
    // console.log("token", req.headers.authorization);
    const authheader = req.headers.authorization;
    if (!authheader) {
        return res.status(401).send('unauthorised access')
    }
    const token = authheader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message: "unauthorised access",

            })
        }

        // request object e ekta property add korlam and value set korlam
        req.decoded = decoded;
        next();
    })
}






/* ################MY MiddleWares  ########################*/





/* ################MY get   ########################*/
// load all cars  based on company
app.get('/cars', async (req, res) => {
    try {
        const { category_name } = req.query;
        // console.log(category_name);

        const result = await carsCollection.find({
            category_name: category_name,
            available: 'instock'
        }).toArray();
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})

// category load
app.get('/category', async (req, res) => {
    try {
        const result = await categoryCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})

// get purchaselist through email
app.get('/myPurchaseList', verifyJWT, async (req, res) => {
    try {
        const decodedEmail = req.decoded.email

        const { email } = req.query;

        if (email !== decodedEmail) {
            return res.status(403).send({
                message: 'forbidden access.!!!'
            })
        }

        // console.log(qey);
        const query = { buyerEmail: email };
        const result = await carPurchaseCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})

// get all users through email
app.get('/users', async (req, res) => {

    try {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})


// jwt implementation 
app.get('/jwt', async (req, res) => {
    try {
        const { email } = req.query;
        const query = {
            email: email
        }
        const result = await usersCollection.findOne(query);
        // console.log(result);
        if (result) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            return res.send({
                token: token
            })
        }
        else {
            return res.status(401).send({
                token: "",
                message: 'You are not our user!!!'
            })
        }

    }
    catch (error) {
        console.log(error.message);
    }
})


app.get('/allCars', async (req, res) => {

    try {
        const result = await carsCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})

/* ################MY get  ########################*/








/* ################MY post   ########################*/

app.post('/user', async (req, res) => {
    try {
        const userInfo = req.body;
        const result = await usersCollection.insertOne(userInfo);
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})
app.post('/purchase', async (req, res) => {
    try {
        const purchaseInfo = req.body;
        const result = await carPurchaseCollection.insertOne(purchaseInfo);
        // updating the availability and load it 
        const data = await carsCollection.updateOne({ _id: ObjectId(purchaseInfo.carID) }, {
            $set: {
                available: "outofstock"
            }
        })
        // console.log(data);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})
// add cars
app.post('/cars/add', async (req, res) => {
    try {
        const carInfo = req.body;
        const result = await carsCollection.insertOne(carInfo);
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})



/* ################MY post  ########################*/

/* ################MY delete   ########################*/

app.delete('/myPurchaseList/:id/:carID', verifyJWT, async (req, res) => {

    try {
        // verifi
        const decodedEmail = req.decoded.email

        const { email } = req.query;

        if (email !== decodedEmail) {
            return res.status(403).send({
                message: 'forbidden access.!!!'
            })
        }

        const { id, carID } = req.params;
        // console.log("trying delet", id);
        const result = await carPurchaseCollection.deleteOne({ _id: ObjectId(id) })
        console.log(result);
        // update the status to rerender in ui
        const data = await carsCollection.updateOne({ _id: ObjectId(carID) }, {
            $set: {
                available: "instock"
            }
        })
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})


// delete cars from db
app.delete('/allCars/:id', async (req, res) => {

    try {
        const { id } = req.params;
        // console.log("trying delet", id);
        const result = await carsCollection.deleteOne({ _id: ObjectId(id) })
        console.log(result);
        // res.send(result)
    } catch (error) {
        console.log(error);
    }

})


/* ################MY delete   ########################*/





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