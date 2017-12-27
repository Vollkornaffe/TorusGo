import React from 'react';

import autoBind from 'react-autobind';

import Animation from '../components/Animation';

class Torus extends React.Component {
  componentDidMount() {
    let {width, height} = this.props;
  
    this.animation = new Animation({
      width: width,
      height: height,
      canvas: this.canvas
    });
    
    this.animation.start();
  }
  
  componentWillUnmount() {
    this.animation.stop();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.animation.setSize(this.props.width, this.props.height);
    }
    
    if(prevProps.delta !== this.props.delta) {
      this.animation.setDelta(this.props.delta);
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