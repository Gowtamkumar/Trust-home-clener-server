const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const fs = require('fs-extra')
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const port = 5000

const app = express();
app.use(cors());
app.use(express.static('uploads'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ty6v7.mongodb.net/${process.env.DB_HOST}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("trusthomeclener").collection("Services");
  const OrderCollection = client.db("trusthomeclener").collection("orders");
  const MakeAdminCollection = client.db("trusthomeclener").collection("Admin");
  const reviewCollection = client.db("trusthomeclener").collection("review");

  app.post('/addservice', (req, res) => {
    const service = req.body.service;
    const price = req.body.price;
    const description = req.body.description;
    // image upload
    const file = req.files.file
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    let image = {
      contentType: file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    };


    serviceCollection.insertOne({ service, price, description, image })

      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addorder', (req, res) => {
    const Addorder = req.body;
    console.log(Addorder)
    OrderCollection.insertOne(Addorder)
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    console.log(email)
    MakeAdminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })

  })

  app.post('/orderUser', (req, res) => {
    const email = req.body.email
    MakeAdminCollection.find({ email: email })
      .toArray((err, admin) => {
        if (admin.length === 0) {

          OrderCollection.find({ email: email })
            .toArray((err, documents) => {
              res.send(documents)
            })
        } else {

          OrderCollection.find({})
            .toArray((err, documents) => {
              res.send(documents)
            })
        }
      })
  })

  // make admin
  app.post('/makeadmin', (req, res) => {
    const makeAdmin = req.body
    console.log(makeAdmin)
    MakeAdminCollection.insertOne(makeAdmin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body
    console.log(review)
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



  app.get('/allorders', (req, res) => {
    OrderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/showreview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/allservices', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



  app.get('/service/:id', (req, res) => {
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })


  app.delete('/delete/:id', (req, res) => {
    serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(documents => {
        res.documents(documents.insertedCount > 0)
      })
  })

  app.get('/', (req, res) => {
    res.send('Trust Home Clener!')
  })

  console.log("database connection")

});

app.listen(port, () => {
  process.env.PORT || port
})