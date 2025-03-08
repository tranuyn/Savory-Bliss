// src/App.js
import Navbar from "./Component/NavBar";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { useSelector } from "react-redux";
import Home from "./pages/Home/Home";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AccountSetting from "./pages/AccountSetting/AccountSetting";
import SearchResults from "./pages/SearchResult/SearchResult";

function App() {
  const user = useSelector((state) => state.auths.user);

  return (
    <div className="App">
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/accountSetting" element={<AccountSetting />} />
          <Route path="/searchResult" element={<SearchResults />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
