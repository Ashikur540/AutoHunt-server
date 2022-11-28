
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.port || 5000
const app = express();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET);



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
const paymentsCollection = client.db('AutoHunt').collection('payments');






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

// make sure to verify Admin after jwt verification
// we are writing this middleware to check if the requested user is really an admin or not
const verifyAdmin = async (req, res, next) => {
    // console.log("inside verify admin++++", req.decoded?.email);
    const decodedEmail = req.decoded?.email;
    const query = { email: decodedEmail };
    const user = await usersCollection.findOne(query);

    if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
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
            // available: 'instock' || 'outofstock',
            paid: false,
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
app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {

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


app.get('/allCars', verifyJWT, async (req, res) => {

    try {
        const result = await carsCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})

// return status of an admin is actually an admin or not

app.get('/users/admin/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // console.log(email)
        const user = await usersCollection.findOne({ email: email });
        // console.log(user);
        console.log(user?.role === 'admin')
        res.send({
            isAdmin: user?.role === 'admin'
        })
    } catch (error) {
        console.log(error);
    }
})
// return status of an seller is actually an seller or not

app.get('/users/seller/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // console.log(email)
        const user = await usersCollection.findOne({ email: email });
        // console.log(user);
        console.log('isSeller', user?.account === 'seller')
        res.send({
            isSeller: user?.account === 'seller'
        })
    } catch (error) {
        console.log(error);
    }
})



// get for payment of specific id car
app.get('/myPurchaseList/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await carPurchaseCollection.findOne({ _id: ObjectId(id) });
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})



// get all buyers
app.get('/users/buyers', async (req, res) => {
    try {
        // const { email } = req.query;

        const allusers = await usersCollection.find({}).toArray();
        const buyers = allusers.filter(user => user.account === 'buyer')
        res.send(buyers)
    } catch (error) {
        console.log(error);
    }
})
// get all sellers
app.get('/users/sellers', async (req, res) => {
    try {
        // const { email } = req.query;

        const allusers = await usersCollection.find({}).toArray();
        const sellers = allusers.filter(user => user.account === 'seller')
        res.send(sellers)
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
app.post('/cars/add', verifyJWT, verifyAdmin, async (req, res) => {
    try {
        const carInfo = req.body;
        const result = await carsCollection.insertOne(carInfo);
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})


// payment api
app.post('/create-payment-intent', async (req, res) => {
    // const { sellingPrice } = req.body;
    const { sellingPrice } = req.body;
    // console.log(sellingPrice);

    // convert to cent or poisa
    const amount = sellingPrice * 100
    // console.log(amount)

    const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        "payment_method_types": [
            "card"
        ],
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
})


// save payments info
app.post('/payments', async (req, res) => {
    const paymentInfo = req.body;
    const result = await paymentsCollection.insertOne(paymentInfo);
    // console.log(result);
    const filter = { _id: ObjectId(paymentInfo.purchasedItemID) };
    const filter2 = { _id: ObjectId(paymentInfo.carID) };
    const updatedDoc = {
        $set: {
            paid: true,
            transactionID: paymentInfo.transactionID,
            carID: paymentInfo.carID,
        }
    }
    const updatedPurchaseData = await carPurchaseCollection.updateOne(filter, updatedDoc)
    const updatedCarData = await carsCollection.updateOne(filter2, updatedDoc)

    res.send(result);
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


// delete cars from db(ADMIN,SELLER)
app.delete('/allCars/:id', verifyJWT, verifyAdmin, async (req, res) => {

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

// delete users from db(ADMIN MUST)
app.delete('/users/:id', async (req, res) => {

    try {
        const { id } = req.params;
        console.log("trying delet", id);
        const result = await usersCollection.deleteOne({ _id: ObjectId(id) })
        console.log(result);
        // res.send(result)
    } catch (error) {
        console.log(error);
    }

})


/* ################MY delete   ########################*/

/* ################MY PUT   ########################*/
app.put('/users/admin/:id', async (req, res) => {
    const { id } = req.params;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await usersCollection.updateOne(filter, updatedDoc, options);
    res.send(result)
})

/* ################MY PUT   ########################*/
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