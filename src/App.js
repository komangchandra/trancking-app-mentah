import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Perjalanan from "./pages/Perjalanan";
import TambahPerjalanan from "./pages/TambahPerjalanan";
import Sampai from "./pages/Sampai";
import Camera from "./components/Camera";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <Router>
        <aside>
          <Navigation />
        </aside>
        <main>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perjalanan" element={<Perjalanan />} />
            {/* <ProtectedRoute path="/perjalanan" component={Perjalanan} /> */}
            <Route path="/perjalanan/:uid" element={<TambahPerjalanan />} />
            <Route path="/sampai/:id" element={<Sampai />} />
            <Route path="/kamera" element={<Camera />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
