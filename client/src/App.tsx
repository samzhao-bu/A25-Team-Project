// if import the css in style, cannot update in docker
// import "/dist/assets/index-Be3pdj7F.css";
import "./styles/style.css"

import { useState} from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fileconvert from "./pages/Fileconvert";
import Translator from "./pages/Translator";
import User from "./pages/User";
import Authpage from "./pages/Authpage";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
//import Sidebar from "./components/Sidebar";



function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <Router>
            <div className="App">
                {/*can see the nav bar iff the user is authenticated */}
                {isAuthenticated && <Navigation />}
                <Routes>
                    {/*if not authenticated, will force to go back to authpage */}
                    <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
                    <Route path="/auth" element={<Authpage />} />
                    <Route path="/fileconvert" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Fileconvert /></ProtectedRoute>} />
                    <Route path="/translator" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Translator /></ProtectedRoute>} />
                    <Route path="/user" element={<ProtectedRoute isAuthenticated={isAuthenticated}><User /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;