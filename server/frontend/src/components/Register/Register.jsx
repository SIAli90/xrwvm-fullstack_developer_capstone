import React, { useState } from "react";
import "./Register.css";
import Header from "../Header/Header";
import user_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async (event) => {
    event.preventDefault();

    const response = await fetch("/djangoapp/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName,
        firstName,
        lastName,
        email,
        password,
      }),
    });

    const result = await response.json();
    if (result.status === "Authenticated") {
      sessionStorage.setItem("username", result.userName);
      sessionStorage.setItem("firstname", firstName);
      sessionStorage.setItem("lastname", lastName);
      window.location.href = "/dealers";
    } else {
      alert(result.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className="register_container" style={{ width: "55%", margin: "40px auto" }}>
        <div className="header">
          <span className="text">Sign-up</span>
        </div>
        <form onSubmit={register}>
          <div className="inputs">
            <div className="input">
              <img src={user_icon} className="img_icon" alt="Username" />
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
            <div className="input">
              <img src={user_icon} className="img_icon" alt="First Name" />
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                className="input_field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <img src={user_icon} className="img_icon" alt="Last Name" />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                className="input_field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <img src={email_icon} className="img_icon" alt="Email" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input_field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <img src={password_icon} className="img_icon" alt="Password" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input_field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="submit_panel">
            <button className="submit" type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
