import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from '../Header/Header';

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadDealer = async () => {
      const [dealerResponse, reviewResponse] = await Promise.all([
        fetch(`/djangoapp/dealer/${id}`),
        fetch(`/djangoapp/reviews/dealer/${id}`),
      ]);

      const dealerResult = await dealerResponse.json();
      const reviewResult = await reviewResponse.json();

      if (dealerResult.status === 200 && dealerResult.dealer.length > 0) {
        setDealer(dealerResult.dealer[0]);
      }
      if (reviewResult.status === 200) {
        setReviews(Array.from(reviewResult.reviews));
      }
      setLoaded(true);
    };

    loadDealer();
  }, [id]);

  const sentimentIcon = (sentiment) => {
    if (sentiment === 'positive') return positive_icon;
    if (sentiment === 'negative') return negative_icon;
    return neutral_icon;
  };

  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  return (
    <div>
      <Header />
      <main style={{ margin: '30px' }}>
        <div style={{ marginTop: '10px' }}>
          <h1 style={{ color: 'grey' }}>
            {dealer.full_name || 'Dealer'}
            {isLoggedIn && (
              <a href={`/postreview/${id}`} title="Review Dealer">
                <img src={review_icon} style={{ width: '60px', marginLeft: '15px' }} alt="Review Dealer" />
              </a>
            )}
          </h1>
          {dealer.city && (
            <h4 style={{ color: 'grey' }}>
              {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
            </h4>
          )}
        </div>

        <h2 className="mt-4">Customer Reviews</h2>
        <div className="reviews_panel">
          {!loaded ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet!</p>
          ) : (
            reviews.map((review) => (
              <div className="review_panel" key={review.id}>
                <img src={sentimentIcon(review.sentiment)} className="emotion_icon" alt={`${review.sentiment} sentiment`} />
                <div className="review">{review.review}</div>
                <div className="reviewer">
                  {review.name} — {review.car_make} {review.car_model} {review.car_year}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dealer;
