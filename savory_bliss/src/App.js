import { useEffect } from "react";
import Navbar from "./Component/NavBar";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home/Home";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AccountSetting from "./pages/AccountSetting/AccountSetting";
import SearchResults from "./pages/SearchResult/SearchResult";
import AddRecipe from "./pages/AddRecipe/AddRecipe";
import Recipes from "./pages/Recipes/Recipes";
import SavedRecipes from "./pages/Saved/Saved";
import ProtectedRoute from "./Component/ProtectedRoute";
import { initAuth } from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();
  // Giữ nguyên state.auths vì đó là tên đúng trong store
  const user = useSelector((state) => state.auths.user);

  useEffect(() => {
    // Thêm console.log để debug
    console.log("App mounted, dispatching initAuth");
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <div className="App">
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/addrecipe" element={
            <ProtectedRoute>
              <AddRecipe />
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/accountSetting" element={
            <ProtectedRoute>
              <AccountSetting />
            </ProtectedRoute>
          } />
                 
          <Route path="/searchResult" element={<SearchResults />} />
          <Route path="/saved" element={<SavedRecipes />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
