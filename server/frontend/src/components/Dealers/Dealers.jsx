import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const selectedState = params.state || 'All';

  const loadDealers = async (state = 'All') => {
    const endpoint = state === 'All'
      ? '/djangoapp/get_dealers'
      : `/djangoapp/get_dealers/${encodeURIComponent(state)}`;

    const response = await fetch(endpoint);
    const result = await response.json();
    if (result.status === 200) {
      const dealers = Array.from(result.dealers);
      setDealersList(dealers);
      if (states.length === 0 || state === 'All') {
        setStates(Array.from(new Set(dealers.map((dealer) => dealer.state))).sort());
      }
    }
  };

  useEffect(() => {
    loadDealers(selectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  const filterDealers = (state) => {
    if (state === 'All') {
      navigate('/dealers');
    } else {
      navigate(`/dealers/${encodeURIComponent(state)}`);
    }
  };

  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  return (
    <div>
      <Header />
      <div style={{ width: '95%', margin: '30px auto' }}>
        <h1>Dealerships</h1>
        <p>Browse dealerships across the United States or filter the list by state.</p>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dealer Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Zip</th>
              <th>
                <select
                  name="state"
                  id="state"
                  value={selectedState}
                  onChange={(e) => filterDealers(e.target.value)}
                >
                  <option value="All">All States</option>
                  {states.map((state) => (
                    <option value={state} key={state}>{state}</option>
                  ))}
                </select>
              </th>
              {isLoggedIn && <th>Review Dealer</th>}
            </tr>
          </thead>
          <tbody>
            {dealersList.map((dealer) => (
              <tr key={dealer.id}>
                <td>{dealer.id}</td>
                <td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td>
                <td>{dealer.city}</td>
                <td>{dealer.address}</td>
                <td>{dealer.zip}</td>
                <td>{dealer.state}</td>
                {isLoggedIn && (
                  <td>
                    <a href={`/postreview/${dealer.id}`}>
                      <img src={review_icon} className="review_icon" alt="Review Dealer" />
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dealers;
