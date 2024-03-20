// navigate throught different pages.
// buttons are on the top

//import React from 'react';
import { NavLink } from 'react-router-dom';


function Navigation() {
  return (
    <div className="topnav">
      <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
        Home
      </NavLink>
      <NavLink to="/fileconvert" className={({ isActive }) => isActive ? "active" : ""}>
        File Convert
      </NavLink>
      <NavLink to="/translator" className={({ isActive }) => isActive ? "active" : ""}>
        File Translator
      </NavLink>
      <NavLink to="/user" className={({ isActive }) => isActive ? "active" : ""}>
        User
      </NavLink>
    </div>
  );
}

export default Navigation;