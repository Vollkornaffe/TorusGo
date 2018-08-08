import {CssBaseline} from '@material-ui/core';
import * as React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import ThreeComponent from './components/ThreeComponent';

export default () => (
  <div>
    <CssBaseline/>
    <Router>
      <div>
        <ThreeComponent
          width={1000}
          height={1000}
          boardSizeX={19}
          boardSizeY={19}
          radius={2}
          thickness={0.5}
          twist={0.0}
          />
      </div>
    </Router>
  </div>
);
