import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default behavior of the link
    try {
      const response = await fetch("http://localhost:5000/api/admin/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent with the request
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message); // Show success message
        navigate("/Login"); // Redirect to the login page
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      alert("An error occurred while logging out. Please try again.");
      console.error(error);
    }
  };

  return (
    <a className="dropdown-item" href="#logout" onClick={handleLogout}>
      Logout
    </a>
  );
};

export default Logout;
