import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Home from './views/Home';

import './App.css';


function App() {
  return (
    <Router>
    <Switch>
      <Route path="/about">
        <div>About</div>
      </Route>
      <Route path="/">
        <Home></Home>
      </Route>
    </Switch>
</Router>
  );
}

export default App;
