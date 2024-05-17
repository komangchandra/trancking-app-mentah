import React, { Component } from "react";
import { auth } from "../config/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import withRouter from "../function/wihRouter";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("userEmail", email);
      window.location.href = `/perjalanan`;
      console.log("Login successful");
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    return (
      <div>
        <h1>Login</h1>
        {this.state.error && <p style={{ color: "red" }}>{this.state.error}</p>}
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>Email: </label>
            <input
              type="email"
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }
}

export default Login;
