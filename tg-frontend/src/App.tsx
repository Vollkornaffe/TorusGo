import {CssBaseline}                    from '@material-ui/core';
import * as React                       from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Layout                           from './components/Layout';
import NewGame                          from './components/NewGame';
import Status                           from './components/StatusContainer';
import ThreeAnimationContainer
                                        from './components/ThreeAnimationContainer';

export default () => (
  <div>
    <CssBaseline />
    <Router>
      <Layout>
        <Route path={'/canvas'} component={ThreeAnimationContainer} />
        <Route path={'/debug'} component={Status} />
        <Route path={'/all'} component={Status} />
        <Route path={'/preferences'} component={NewGame} />
      </Layout>
    </Router>
  </div>
);
