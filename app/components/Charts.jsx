import React, { Component } from "react";
import { Chart, Axis, Geom, Tooltip } from "bizcharts";
import { Row, Col } from "antd";

class Charts extends Component {
  render() {
    return (
      <Row gutter={24} style={{ margin: "24px 8px" }}>
          <Col span={18}>
            <Chart
              height={400}
              data={this.props.dataSource}
              scale={{y: { tickInterval: this.props.interval }}}
              forceFit
            >
              <Axis name="x" />
              <Axis name="y" />
              <Tooltip crosshairs={{ type: "y" }} />
              <Geom type="interval" position="x*y" />
            </Chart>
          </Col>
          <Col span={6}>
            <ol>
              {this.props.values}
            </ol>
          </Col>
      </Row>
    );
  }
}

export default Charts;
