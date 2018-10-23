import React from "react";
import {Chart, Geom, Axis, Tooltip, Legend} from "bizcharts";
// import DataSet from "@antv/data-set";

class AreaChart extends React.Component {
    render() {
        const {data} = this.props;
        // var dv = new DataSet.View().source(data);
        // dv.transform({
        //     type: "fold",
        //     fields: ["TCP Holepunch", "UDP Holepunch","Average"],
        //     key: "type",
        //     value: "value"
        // });
        const scale = {
            value: {
                alias: "The Share Price in Dollars",
                formatter: (val) => `${val}%`
            },
            logCount: {
                tickCount: 10,
                range: [0, 1]
            }
        };
        return (
            <div>
                <Chart
                    height={500}
                    data={data}
                    padding={"auto"}
                    scale={scale}
                    forceFit
                >
                    <Tooltip crosshairs />
                    <Axis />
                    <Legend position="bottom-right" />
                    <Geom type="area" position="logCount*value" color="type" shape="smooth" />
                    <Geom
                        type="line"
                        position="logCount*value"
                        color="type"
                        shape="smooth"
                        size={2}
                    />
                </Chart>
            </div>
        );
    }
}

export default AreaChart;

