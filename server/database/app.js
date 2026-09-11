const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3030;
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo_db:27017/';
const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const reviewsData = JSON.parse(fs.readFileSync('reviews.json', 'utf8')).reviews;
const dealershipsData = JSON.parse(fs.readFileSync('dealerships.json', 'utf8')).dealerships;
let memoryReviews = reviewsData.map((item) => ({ ...item }));
let memoryDealers = dealershipsData.map((item) => ({ ...item }));

const Reviews = require('./review');
const Dealerships = require('./dealership');

async function seedMongo() {
  try {
    await mongoose.connect(mongoUrl, { dbName: 'dealershipsDB' });
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviewsData);
    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealershipsData);
    console.log('MongoDB dealership and review data loaded.');
  } catch (error) {
    console.error('MongoDB initialization failed:', error.message);
  }
}

if (useMemoryDb) {
  console.log('Dealer API is using in-memory JSON data.');
} else {
  seedMongo();
}

const allReviews = async () => {
  if (useMemoryDb) return memoryReviews;
  return Reviews.find().sort({ id: 1 }).lean();
};

const reviewsByDealer = async (dealerId) => {
  if (useMemoryDb) {
    return memoryReviews.filter((review) => Number(review.dealership) === dealerId);
  }
  return Reviews.find({ dealership: dealerId }).sort({ id: 1 }).lean();
};

const allDealers = async () => {
  if (useMemoryDb) return memoryDealers;
  return Dealerships.find().sort({ id: 1 }).lean();
};

const dealersByState = async (state) => {
  if (state.toLowerCase() === 'all') return allDealers();
  if (useMemoryDb) {
    return memoryDealers.filter(
      (dealer) => String(dealer.state || '').toLowerCase() === state.toLowerCase()
    );
  }
  return Dealerships.find({ state: { $regex: `^${state}$`, $options: 'i' } })
    .sort({ id: 1 })
    .lean();
};

const dealerById = async (dealerId) => {
  if (useMemoryDb) {
    return memoryDealers.filter((dealer) => Number(dealer.id) === dealerId);
  }
  return Dealerships.find({ id: dealerId }).lean();
};

app.get('/', (req, res) => {
  res.send('Welcome to the Mongoose API');
});

app.get('/fetchReviews', async (req, res) => {
  try {
    res.json(await allReviews());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    res.json(await reviewsByDealer(Number(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers', async (req, res) => {
  try {
    res.json(await allDealers());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    res.json(await dealersByState(req.params.state));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    res.json(await dealerById(Number(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});

app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    const existing = await allReviews();
    const newId = Math.max(0, ...existing.map((review) => Number(review.id) || 0)) + 1;
    const newReview = {
      id: newId,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      purchase: Boolean(data.purchase),
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: Number(data.car_year),
    };

    if (useMemoryDb) {
      memoryReviews.push(newReview);
      return res.json(newReview);
    }

    const savedReview = await new Reviews(newReview).save();
    return res.json(savedReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error inserting review' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
