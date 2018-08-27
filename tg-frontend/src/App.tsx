import {CssBaseline} from '@material-ui/core';
import * as React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import ThreeComponent from './components/ThreeComponent';

interface IState {
  twist: number,
};

export default class App extends React.Component<{},IState> {
  public constructor(props: any) {
    super(props);
    this.state = {twist: 0.0};
  }

  public componentDidMount() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      switch(event.code) {
        case "KeyQ":
        {
          this.setState({twist: 1.0});
        }
        case "KeyE":
        {
          this.setState({twist: -1.0});
        }
      }
    });

    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.setState({twist: 0.0});
    });
  }

  public render() {
    return (
      <div>
        <CssBaseline/>
        <Router>
          <div>
            <ThreeComponent
              width={1000}
              height={1000}
              boardSizeX={19}
              boardSizeY={19}
              radius={1.5}
              thickness={1}
              twist={this.state.twist}
              lineOff={0.0}
              />
          </div>
        </Router>
      </div>
    );
  }
};
