import React, { Component } from "react";
import { Col } from "antd";
import { Chart, Coord, Geom, Tooltip, Legend, Guide } from "bizcharts";

const { Html } = Guide;

export default class PieCharts extends Component {
  constructor() {
    super();
    this.state = {
      type: '',
      percent: 100
    }
  }
  // percent(e) {
  //   const value = this.props.data.map(val => val.value);
  //   let num = value.reduce((a, b) => a + b);
  //   let percentage = ((e.data._origin.value / num) * 100).toFixed(0);
  //   this.setState({ type: e.data._origin.type, percent: percentage })
  // }

  render() {
    return (
      <Col className="pie-chart-1">
        <Chart
          height={350}
          padding="auto"
          data={this.props.data}
          forceFit
        >
          <Coord type="theta" radius={0.7} innerRadius={0.8} />
          <Legend
            position="right-center"
            textStyle={{
              fontSize: '14',
              fill: 'rgba(0, 0, 0, 0.65)'
            }}
            itemMarginBottom={16}
            custom={true}
            items={this.props.data.map((item) => {
              return {
                value: `${item.type}\t\t${item.value}`,
                marker: {
                  symbol: 'circle',
                  radium: 5,
                  fill: item.type === 'Successful' ? '#52C41A' : '#DADADA'
                }
              };
            })}
          />

          <Guide>
            <Html
              position={["50%", "50%"]}
              html={`<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">${'Success Rate'}<br><span style="color:#262626;font-size:2.5em">${this.props.percent}</span>%</div>`}
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Tooltip showTitle={false} />
          <Geom
            type="intervalStack"
            position="value"
            color={['type', (type) => {
              if (type.indexOf('Successful') !== -1 ) {
                return '#52C41A';
              }
              return `#DADADA`;
            }]}
            style={{
              lineWidth: 5,
              stroke: "#fff"
            }}
          />
        </Chart>
      </Col>
    );
  }
}
