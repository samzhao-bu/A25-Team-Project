// if import the css in style, cannot update in docker
import "/dist/assets/index-Be3pdj7F.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fileconvert from "./pages/Fileconvert";
import Translator from "./pages/Translator";
import User from "./pages/User";
import Navigation from "./components/Navigation";
//import Sidebar from "./components/Sidebar";

function App() {
    return (
        <Router>
            <div className="App">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route path="/fileconvert" element={<Fileconvert />} />
                    
                    <Route path="/translator" element={<Translator />} />

                    <Route path="/user" element={<User />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;