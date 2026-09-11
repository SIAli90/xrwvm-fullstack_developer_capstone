import React, { useState } from 'react';
import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);

  const login = async (event) => {
    event.preventDefault();

    const response = await fetch('/djangoapp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password }),
    });

    const result = await response.json();
    if (result.status === 'Authenticated') {
      sessionStorage.setItem('username', result.userName);
      sessionStorage.setItem('firstname', result.firstName || '');
      sessionStorage.setItem('lastname', result.lastName || '');
      setOpen(false);
      window.location.href = '/dealers';
    } else {
      alert('The user could not be authenticated.');
    }
  };

  if (!open) return null;

  return (
    <div>
      <Header />
      <div onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="modalContainer">
          <form className="login_panel" onSubmit={login}>
            <div>
              <span className="input_field">Username </span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input_field"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div>
              <span className="input_field">Password </span>
              <input
                name="psw"
                type="password"
                placeholder="Password"
                className="input_field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <input className="action_button" type="submit" value="Login" />
              <input className="action_button" type="button" value="Cancel" onClick={() => setOpen(false)} />
            </div>
            <a className="loginlink" href="/register">Register Now</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
