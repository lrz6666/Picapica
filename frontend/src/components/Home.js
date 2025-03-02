import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

/* A */
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="background-gradient h-screen flex  flex-col justify-center items-center text-center">
      <div className="home-container"> 
        <h1 className="text-5xl font-bold text-pink-600 mb-4">picapica</h1> 
        <p className="text-lg text-gray-700 mb-6">
          Welcome to Agnes' photobooth! This is your personal photobooth at home.
        </p>     
        <div style={{ height: "20px" }}></div>
       
        <p className="text-lg text-gray-700 mb-6 mt-4">
          Please use our new link at <a href="https://picapicabooth.com" className="text-blue-500 underline">picapicabooth.com</a>
        </p> 

        <img src="/photobooth-strip.png" alt="photobooth strip" className="photobooth-strip"/>
        
        <button onClick={() => navigate("/welcome")} className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition">
          START
        </button>

        <footer className="mt-8 text-sm text-gray-600">
          <p>
            made by{" "}
            <a
              href="https://agneswei.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: "pink", textDecoration: "none" }}>
              agneswei
              </a>
            </p>
            <p>© 2025 Agnes Wei. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
    );
  };

export default Home;
