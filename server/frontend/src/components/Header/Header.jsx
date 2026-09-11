import React from 'react';
import "../assets/style.css";
import "../assets/bootstrap.min.css";

const Header = () => {
  const logout = async (event) => {
    event.preventDefault();
    const username = sessionStorage.getItem('username');
    const response = await fetch('/djangoapp/logout');
    if (response.ok) {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('firstname');
      sessionStorage.removeItem('lastname');
      alert(`Logging out ${username}...`);
      window.location.href = '/dealers';
    } else {
      alert('The user could not be logged out.');
    }
  };

  const currentUser = sessionStorage.getItem('username');

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: 'darkturquoise', minHeight: '1in' }}>
      <div className="container-fluid">
        <h2 style={{ paddingRight: '5%' }}>Cars Dealership</h2>
        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="/dealers">Dealers</a></li>
            <li className="nav-item"><a className="nav-link" href="/about">About Us</a></li>
            <li className="nav-item"><a className="nav-link" href="/contact">Contact Us</a></li>
          </ul>
          <div className="input_panel">
            {currentUser ? (
              <>
                <span className="username" style={{ fontSize: '20px', marginRight: '15px' }}>{currentUser}</span>
                <a className="nav_item" href="/djangoapp/logout" onClick={logout}>Logout</a>
              </>
            ) : (
              <>
                <a className="nav_item" href="/login">Login</a>
                <a className="nav_item" href="/register">Register</a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
