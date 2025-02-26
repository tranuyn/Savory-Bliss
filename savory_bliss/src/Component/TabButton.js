import React from "react";
import { NavLink } from "react-router-dom";
import './TabButton.css';

const TabButton = ({ icon: Icon, active, href }) => {
  return (
    <NavLink
      to={href}
      className={active ? "tab-button active-tab" : "tab-button text-secondary"}
    >
      <Icon className={active ? "text-active" : "text-secondary"} />
    </NavLink>
  );
};

export default TabButton;
