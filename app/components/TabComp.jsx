import React, { Component } from "react";
import { Tabs, Row, Col, Dropdown, Button, Icon, Menu, Card, Skeleton } from "antd";
import DropdownOptions from "./SubComponents/DropDownRender";
import Charts from "./Charts";
import LineChart from "./LineChart";
import Tables from "../components/Tables";
import AreaChart from "../components/AreaChart";

const { Meta } = Card;
const TabPane = Tabs.TabPane;

export class RenderBarChart extends Component {
  render() {
    const { chartData } = this.props;
    return (
      <Row gutter={24} style={{ margin: "24px 8px" }}>
        <Col className="gutter-row" span={24}>
          <Card
            style={{
              background: "#fff",
              borderRadius: 5,
              minHeight: 500
            }}>
            <Charts values={chartData.values} dataSource={chartData.dataSource} interval={chartData.interval} />
          </Card>
        </Col>
      </Row>
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
              borderRadius: 5,
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
          <Tables dataSource={tableData} dropDownFilter={tabData.selectedLabel}/>
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
              <div className="chat-2">
                <AreaChart data={chartData.data} />
              </div>
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

  TabContent(key, tabName, tabData, chartData, tableData, filteredLogs, loading) {
    console.log('Render Chart', chartData);
    return (
      <TabPane tab={tabName} key={key} className="tab-1-panel">
        <DropdownOptions contents={tabData.contents} data={tabData.data} mod={tabData.mod} filterAction={tabData.filterAction}
          labels={tabData.labels} selectedLabel={tabData.selectedLabel} />
        {/* <RenderAreaChart showFailedCount={this.props.showFailedCount} chartData={chartData} filteredLogs={filteredLogs} loading={loading}/> */}
        <RenderTable tableData={tableData} loading={loading} tabData={tabData}/>
      </TabPane>
    )
  }

  render() {
    const { loading, tabData, chartData, tableData, filteredLogs } = this.props;
    return (
      <div className="tab-1">
        <Tabs defaultActiveKey="1" onChange={this.callback} size="large">
          {this.TabContent(1, "All Activity", tabData, chartData, tableData, filteredLogs, loading)}
        </Tabs>
      </div>
    );
  }

}
export default TabComp;
