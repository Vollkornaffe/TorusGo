'use strict';
import React from 'react';

import autoBind from 'react-autobind';

import Animation from '../components/Animation';

class Torus extends React.Component {
  componentDidMount() {
    let {width, height} = this.props;

    this.animation = new Animation({
      width: width,
      height: height,
      canvas: this.canvas,

      //board properties
      boardSize: this.props.boardSize,
      boardState: this.props.boardState
    });

    this.animation.start();
  }
  
  componentWillUnmount() {
    this.animation.stop();
    this.canvas = null;
    this.animation = null;
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.animation.setSize(this.props.width, this.props.height);
    }
    
    if(prevProps.delta !== this.props.delta) {
      this.animation.setDelta(this.props.delta);
    }

    if(prevProps.cursor !== this.props.cursor) {
      this.animation.setCursor(this.props.cursor);
    }

    if (prevProps.boardState !== this.props.boardState) {
      this.animation.setBoardState(this.props.boardState);
    }

    if (prevProps.scoringMarks !== this.props.scoringMarks) {
      this.animation.setScoringMarks(this.props.scoringMarks);
    }
  }
  
  render() {
    const {width, height} = this.props;
    return (
      <canvas
        ref={(canvas) => {this.canvas = canvas}}
        width={width}
        height={height}
      />
    );
  }
}

export default Torus;