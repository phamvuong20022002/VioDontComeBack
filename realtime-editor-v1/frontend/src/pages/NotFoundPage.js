import React from "react";
import '../NotFound.css'
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  setTimeout(() => {
    navigate('/')
  }, 2800);

  return (
    <div className="container-not-found">
      <h1>404</h1>
      <img src="https://i.pinimg.com/originals/3a/8b/cb/3a8bcbd278cdbba800afe589262399b7.gif" alt="Not Found 404 GIF"/>
    </div>
  );
};

export default NotFoundPage;
