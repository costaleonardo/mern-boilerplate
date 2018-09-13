import React, { Component } from 'react';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Navbar />
        <Landing />
      </div>
    );
  }
};

export default App;