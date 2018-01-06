import autoBind from 'react-autobind';

import { Vector3, Face3, Geometry } from 'three';

class CustomTorusGeometry extends Geometry {

  constructor(radius, thickness, XSegments, YSegments) {
    super();
    
    autoBind(this);
  
    this.parameters = {
      radius: radius,
      thickness: thickness,
      XSegments: XSegments,
      YSegments: YSegments,
      twist: 0.0,
    };
  
    // Indices for convenience
    this.quadFaces = [];
    
    // Normals since we can compute them efficiently on the way
    this.quadNormals = [];
    
    this.initGeometry();
    this.updateGeometry();
  }
  
  /**
   * creates connectivity (faces and quadFaces)
   */
  initGeometry() {

    // vertex id
    let vId = 0;

    // for conveniece
    let x_seg = this.parameters.XSegments;
    let y_seg = this.parameters.YSegments;

    for (let i = 0; i < x_seg; i++) {
      for (let j = 0; j < y_seg; j++) {

        // generate faces and quadFaces
        if (i !== 0 && j !== 0) {
          this.faces.push(new Face3(
            vId - 1, vId, vId - y_seg
          ));
          this.faces.push(new Face3(
            vId - 1, vId - y_seg, vId - 1 - y_seg
          ));
          this.quadFaces[vId] = [
            vId, vId - y_seg, vId - 1 - y_seg, vId - 1
          ];

          if (j === y_seg - 1) {
            this.faces.push(new Face3(
              vId, vId - y_seg + 1, vId - y_seg - y_seg + 1
            ));
            this.faces.push(new Face3(
              vId, vId - y_seg - y_seg + 1, vId - y_seg
            ));
            this.quadFaces[vId - y_seg + 1] = [
              vId, vId - y_seg + 1, vId - y_seg - y_seg + 1, vId - y_seg
            ];
          }
          if (i === x_seg - 1) {
            this.faces.push(new Face3(
              j - 1, j, vId
            ));
            this.faces.push(new Face3(
              j - 1, vId, vId - 1
            ));
            this.quadFaces[j] = [
              j, j - 1, vId, vId - 1
            ];
          }
          if (i === x_seg - 1 && j === y_seg - 1) {
            this.faces.push(new Face3(
              j, 0, vId - y_seg + 1
            ));
            this.faces.push(new Face3(
              j, vId - y_seg + 1, vId
            ));
            this.quadFaces[0] = [
              0, j, vId - y_seg + 1, vId
            ];
          }
        }

        vId++;

      }
    }

    this.dynamic = true;
  }

  /**
   * called for initialization and
   * should be called whenever the twist parameter is changed
   */
  updateGeometry = function () {

    // for conviniece
    let x_seg = this.parameters.XSegments;
    let y_seg = this.parameters.YSegments;

    // axis
    let x_ax = new Vector3(1,0,0);
    let y_ax = new Vector3(0,1,0);

    for (let i = 0; i < x_seg; i++) {

      // this is where the TWIST has an influence!
      let i_rad = i / x_seg * 2 * Math.PI + this.parameters.twist;

      // first we compute the 'offsets', meaning one of many identical 'ring' segments
      let offset = new Vector3(
        this.parameters.thickness * Math.cos(i_rad),
        this.parameters.thickness * Math.sin(i_rad),
        0
      );

      // now we can spin the ring to form a complete torus!
      for (let j = 0; j < y_seg; j++) {
        let j_rad = j / x_seg * 2 * Math.PI;

        // individual vertex positions
        let newPos = new Vector3();

        // first copy the ring position
        newPos.copy(offset);

        // then put it at the disired radius, in y-direction
        newPos.addScaledVector(y_ax, this.parameters.radius);

        // and rotate it around the x-axis to get to the final position
        newPos.applyAxisAngle(x_ax, j_rad);

        this.vertices.push(newPos);
      }
    }

    this.verticesNeedUpdate = true;
    this.computeVertexNormals();
  }
}

export default CustomTorusGeometry;
