import React, { Component } from "react";
import { Chart, Coord, Geom, Tooltip, Legend, Guide } from "bizcharts";

const { Html } = Guide;

export default class PieCharts extends Component {
	constructor() {
			super();
		  this.state = {
			  //type: this.props.title,
				type: '',
			  percent: 100}
	}

  percent(e) {
    const value = this.props.data.map(val => val.value);
    let num = value.reduce((a, b) => a + b);
    let percentage = ((e.data._origin.value/num) * 100).toFixed(0);
    this.setState({type: e.data._origin.type, percent: percentage})
  }
  
  render() {
    return (
      <Chart
        width={300}
        height={window.innerWidth <= 1490 ? 250 : 320}
        padding={[-10, 120, 0, -10]}
        data={this.props.data}
        onPlotClick={this.percent}
        forceFit
      >
        <Coord type="theta" radius={0.7} innerRadius={0.8} />
        <Legend
        
          position="right"
          offsetY={-window.innerHeight / 4 + 50 }
          offsetX={-50}
        />
        <Guide>
          <Html
            position={["50%", "50%"]}
            html={`<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">${this.state.type}<br><span style="color:#262626;font-size:2.5em">${this.props.percent}</span>%</div>`}
            alignX="middle"
            alignY="middle"
          />
        </Guide>
        <Tooltip showTitle={false} />
        <Geom
          type="intervalStack"
          position="value"
          color="type"
          style={{
            lineWidth: 5,
            stroke: "#fff"
          }}
        />
      </Chart>
    );
  }
}

