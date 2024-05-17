import React, { Component } from "react";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.href = `/login`;
  };

  render() {
    return (
      <>
        <div>Welcome to hello world</div>
        <button onClick={this.logout}>logout</button>
      </>
    );
  }
}

export default Home;
