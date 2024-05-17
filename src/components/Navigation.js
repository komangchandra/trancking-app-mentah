import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/login">login</Link>
        </li>
        <li>
          <Link to="/perjalanan">Perjalanan</Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
