import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StarRating maxRating={5} color="blue" onSetRating={setMovieRating} />
//       <p>This movie was {movieRating}</p>
//     </div>
//   );
// }
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <StarRating maxRating={5} /> */}
    <App />
    {/* <StarRating
      maxRating={10}
      size={24}
      mesage={[
        "good",
        "very good",
        "great",
        "amazing",
        "awsome",
        "awsome",
        "awsome",
        "awsome",
        "awsome",
        "awsome",
      ]}
    />
    <Test /> */}
  </React.StrictMode>
);
