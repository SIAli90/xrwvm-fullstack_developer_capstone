const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3030;
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo_db:27017/';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync('dealerships.json', 'utf8'));

mongoose.connect(mongoUrl, { dbName: 'dealershipsDB' });

const Reviews = require('./review');
const Dealerships = require('./dealership');

async function seedData() {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data.reviews);
    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data.dealerships);
    console.log('Dealership and review data loaded.');
  } catch (error) {
    console.error('Error loading seed documents:', error);
  }
}

seedData();

app.get('/', (req, res) => {
  res.send('Welcome to the Mongoose API');
});

app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find().sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    const documents = await Reviews.find({ dealership: dealerId }).sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find().sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = state.toLowerCase() === 'all'
      ? {}
      : { state: { $regex: `^${state}$`, $options: 'i' } };
    const documents = await Dealerships.find(query).sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    const documents = await Dealerships.find({ id: dealerId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});

app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    const documents = await Reviews.find().sort({ id: -1 }).limit(1);
    const newId = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Reviews({
      id: newId,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: Number(data.car_year),
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
