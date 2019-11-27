import React from "react";
import "./App.css";
import Grid from "../grid/Grid";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 className="App-title"> Pixel Art Creator </h1>
      <Grid />
    </div>
  );
};

export default App;
