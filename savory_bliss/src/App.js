import logo from './logo.svg';
import Navbar from './Component/NavBar';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar user={true}/>
      </BrowserRouter>
    </div>
    
  );
}
export default App;
