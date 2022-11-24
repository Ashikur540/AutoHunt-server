
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.port || 5000
const app = express();

// middleware
app.use(cors());
app.use(express.json());



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.6vknfdj.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri);


// // load all appointments data
// const DBConnect = async () => {
//     try {
//         client.connect();
//         console.log("success connection");
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// DBConnect();


























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