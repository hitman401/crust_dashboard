import React, { Component } from "react";
import { Tabs, Row, Col, Dropdown, Button, Icon, Menu, Card, Skeleton } from "antd";
import DropdownOptions from "./SubComponents/DropDownRender";
import Charts from "./Charts";
import LineChart from "./LineChart";
import PieCharts from "../components/PieCharts";
import Tables from "../components/Tables";
import AreaChart from "../components/AreaChart";

import {globalNetworkActivity,protocolData} from "../assets/data";
const { Meta } = Card;
const TabPane = Tabs.TabPane;

export class RenderBarChart extends Component {
  render() {
    const { data } = this.props;
    const chartData = [
      {
        x: "TCP HP",
        y: data.tcp
      },
      {
        x: "UDP HP",
        y: data.udp
      },
      {
        x: "Direct",
        y: data.direct
      }  
    ];
    return (
        <Card
            style={{
              background: "#fff",
              borderRadius: 5,
              minHeight: 500
            }}
            title="Protocol Success"
            >
            <Charts dataSource={chartData} interval={Math.round((data.tcp+data.udp+data.direct)/3)} />
          </Card>
    )
  }
}

export class RenderPieChart extends Component {
  render() {
    const { data } = this.props;
    const chartData = [
      {
        type: "Successful",
        value: data.success
      },
      {
        type: "Failed",
        value: data.failed
      }
    ];
    const percent = Math.round(data.success/(data.success+data.failed)*100)
    return (
      <div>      
          <Card
            style={{
              background: "#fff",
              borderRadius: 10,
              minHeight: 500
            }}
            title="Connections"
          >
          <div>{data.success+ data.failed}</div>
          <div>{"Total Successful Connections"}</div>
            <PieCharts data={chartData} percent={percent} title="Success Rate" />
          </Card>
      </div>
    )
  }
}

export class RenderLineChart extends Component {
  render() {
    const { data } = this.props;
    return (
      <Row gutter={24} style={{ margin: "24px 8px" }}>
        <Col className="gutter-row" span={24}>
          <Card
            style={{
              background: "#fff",
              borderRadius: 10,
              minHeight: 500
            }}>
            <LineChart data={data} height={400} titleMap={{ y1: 'Total', y2: 'Successful', y3: 'Failed' }} />
          </Card>
        </Col>
      </Row>
    )
  }
}

export class RenderTable extends Component {
  render() {
    const { tableData, loading, tabData } = this.props;
    return (
      <Row gutter={24}>
        <Col className="gutter-row" span={24}>
          <Card
            bordered={false}
            style={{
              background: "#fff",
              borderRadius: 5,
              minHeight: 100
            }}
            className="cus-card-1 table-1 tab-1-base"
            title="All Connection Attempts"
          >
            {/* <div className="table-1-opt">
            <Button type="primary" icon="download" size="large">Download CSV</Button>
          </div> */}
            <Skeleton loading={loading} paragraph={{ rows: 15 }} active animate>
              <Tables dataSource={tableData} dropDownFilter={tabData.selectedLabel} />
            </Skeleton>
          </Card>
        </Col>
      </Row>
    )
  }
}

export class RenderAreaChart extends Component {
  render() {
    const { chartData, filteredLogs, loading } = this.props;
    return (
      <Row gutter={24}>
        <Col className="gutter-row" span={24}>
          <Card
            bordered={false}
            style={{
              background: "#fff",
              borderRadius: 5,
              minHeight: 100
            }}
            className="cus-card-1 chart-1 tab-1-base"
            title="Connection Success Rate"
          >
            <Skeleton loading={loading} paragraph={{ rows: 15 }} active animate>
              <div className="x-axis-label">Cumulative Attempts</div>
              {
                this.props.showFailedCount ? (
                  <div className="chart-1-meta">
                    <div className="chart-1-meta-val">{filteredLogs.length - chartData.failed}</div>
                    <div className="chart-1-meta-desc">Successful Connections</div>
                    <div className="chart-1-meta-val">{chartData.failed}</div>
                    <div className="chart-1-meta-desc">Failed Connections</div>
                  </div>
                ) : (
                    <div className="chart-1-meta">
                      <div className="chart-1-meta-val">{filteredLogs.length - chartData.failed}</div>
                      <div className="chart-1-meta-desc">Successful Connections</div>
                    </div>
                  )
              }
              <div className="chat-2"><AreaChart data={chartData.data} /></div>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    )
  }
}
class TabComp extends Component {
  callback(key) {
    console.log(key);
  }

  TabContent(key, tabName, tabData, tableData, filteredLogs, loading, pieChartData, barChartData) {
    return (
      <TabPane tab={tabName} key={key} className="tab-1-panel">
        <DropdownOptions contents={tabData.contents} data={tabData.data} mod={tabData.mod} filterAction={tabData.filterAction}
          labels={tabData.labels} selectedLabel={tabData.selectedLabel} />
        {/* <RenderAreaChart showFailedCount={this.props.showFailedCount} chartData={chartData} filteredLogs={filteredLogs} loading={loading}/> */}
        <Row gutter={24} style={{ margin: "24px 8px" }}>
          <Col className="gutter-row" span={12}>
            <RenderPieChart data={pieChartData}/>
          </Col>
          <Col className="gutter-row" span={12
          }>
            <RenderBarChart data={barChartData}/>
          </Col> 
        </Row>
        <RenderTable tableData={tableData} loading={loading} tabData={tabData} />
      </TabPane>
    )
  }

  render() {
    const { loading, tabData, tableData, filteredLogs, pieChartData, barChartData } = this.props;
    return (
      <div className="tab-1">
        <Tabs defaultActiveKey="1" onChange={this.callback} size="large">
          {this.TabContent(1, "All Activity", tabData, tableData, filteredLogs, loading, pieChartData, barChartData)}
        </Tabs>
      </div>
    );
  }

}
export default TabComp;
