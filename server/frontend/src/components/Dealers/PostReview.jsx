import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [carModels, setCarModels] = useState([]);

  useEffect(() => {
    if (!sessionStorage.getItem('username')) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      const [dealerResponse, carsResponse] = await Promise.all([
        fetch(`/djangoapp/dealer/${id}`),
        fetch('/djangoapp/get_cars'),
      ]);
      const dealerResult = await dealerResponse.json();
      const carsResult = await carsResponse.json();

      if (dealerResult.status === 200 && dealerResult.dealer.length > 0) {
        setDealer(dealerResult.dealer[0]);
      }
      if (carsResult.CarModels) {
        setCarModels(Array.from(carsResult.CarModels));
      }
    };

    loadData();
  }, [id, navigate]);

  const postReview = async () => {
    const firstName = sessionStorage.getItem('firstname') || '';
    const lastName = sessionStorage.getItem('lastname') || '';
    const username = sessionStorage.getItem('username') || '';
    const name = `${firstName} ${lastName}`.trim() || username;

    if (!model || !review.trim() || !date || !year) {
      alert('All details are mandatory');
      return;
    }

    const selected = carModels.find(
      (carModel) => `${carModel.CarMake}|||${carModel.CarModel}` === model
    );
    if (!selected) {
      alert('Please select a valid car make and model.');
      return;
    }

    const response = await fetch('/djangoapp/add_review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        dealership: Number(id),
        review: review.trim(),
        purchase: true,
        purchase_date: date,
        car_make: selected.CarMake,
        car_model: selected.CarModel,
        car_year: Number(year),
      }),
    });

    const result = await response.json();
    if (result.status === 200) {
      navigate(`/dealer/${id}`);
    } else {
      alert(result.message || 'The review could not be posted.');
    }
  };

  return (
    <div>
      <Header />
      <main style={{ margin: '5%' }}>
        <h1 style={{ color: 'darkblue' }}>Post Review — {dealer.full_name || 'Dealer'}</h1>

        <label htmlFor="review"><strong>Review</strong></label><br />
        <textarea
          id="review"
          cols="60"
          rows="7"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell other customers about your dealership experience"
        />

        <div className="input_field">
          Purchase Date{' '}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="input_field">
          Car Make and Model{' '}
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="" disabled>Choose Car Make and Model</option>
            {carModels.map((carModel, index) => (
              <option
                key={`${carModel.CarMake}-${carModel.CarModel}-${index}`}
                value={`${carModel.CarMake}|||${carModel.CarModel}`}
              >
                {carModel.CarMake} {carModel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year{' '}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
          />
        </div>

        <button className="postreview" type="button" onClick={postReview}>Post Review</button>
      </main>
    </div>
  );
};

export default PostReview;
