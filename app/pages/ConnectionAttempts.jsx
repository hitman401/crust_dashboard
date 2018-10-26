import React, { Component } from "react";
import { Row, Col, Card, Icon} from "antd";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import "./Dashboard.css";
import { revalidate, filterChange, filterPieChart } from '../redux/dispatcher/logs_action';
//import DropDown from "../components/SubComponents/DropDownRender";
import TabComp from "../components/TabComp";
import { isEquivalent } from "../redux/utils";
import { MOD_NAME } from "../redux/reducers/ConnectionAttempt/activity";
import { PROTOCOL } from '../redux/FilterTypes';

class ConnectionAttempts extends Component {
  constructor(props) {
    super(props);
  }

  // componentDidMount() {
  //   this.props.revalidate(this.props.store.filteredConnectionResults, this.props.activity.filter);
  // }

  componentWillUpdate(nextProps) {
    const hasFilterChanged = !isEquivalent(this.props.activity.filter, nextProps.activity.filter, ['Protocol']);
    const hasNewLogs = !isEquivalent(this.props.store.filteredConnectionResults, nextProps.store.filteredConnectionResults)
    if (hasFilterChanged) {
      this.props.revalidate(this.props.store.filteredConnectionResults, nextProps.activity.filter);
    }

    if (hasNewLogs) {
      this.props.revalidate(nextProps.store.filteredConnectionResults, this.props.activity.filter);
    }
  }

  render() {
    const tabData = {
      contents: ["NAT Type", "Protocol", "O.S.", "Country"],
      data: this.props.store.filteredConnectionResults,
      mod: MOD_NAME,
      filterAction: this.props.filterChange,
      labels: this.props.store.filteredLogs,
      selectedLabel: this.props.activity.filter
    };
    const pieChartData = { 
      loading: this.props.activity.pieChart.isComputing, 
      total: this.props.activity.pieChart.total,
      success: this.props.activity.pieChart.success 
    };
    const barChartData = {
      max : this.props.activity.filteredLogs.length,
      tcp : this.props.activity.tcpHpCount,
      udp : this.props.activity.udpHpCount,
      direct : this.props.activity.directCount
    };
    return (
      <div className="page-1">
        <span className="page-1-head">
            <h1 className="page-1-head-title">Connection Attempts
          {/* <Icon type="info-circle" theme="outlined" style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.45)' }} /> */}
            </h1>
            <div className="page-1-head-info">
            Want to participate? <a href="https://safenetforum.org/t/crust-nat-traversal-test/25799" target="_blank">Join the test</a>
          </div>

            <div className="page-1-head-opts">
              {/* <h3 className="page-1-head-opts-title">Connection result:</h3> */}
              {/* <ButtonGroup selectedIndex={this.props.store.connectionResultFilter}
              changeFilter={this.props.filterByConnectionResult} /> */}
            </div>
        </span>
        <Row gutter={24}>
          <Col className="gutter-row" span={24}>
            <Card
              bordered={false}
              style={{
                background: "#fff",
                borderRadius: 5,
                minHeight: 100
              }}
              className="tab-1-base"
            >
              {/* <DropDown contents={["NAT Type", "Protocol", "O.S.", "Country"]} data={this.props.store.filteredConnectionResults} mod={MOD_NAME} filterAction={this.props.filterChange}
                labels={this.props.store.filteredLogs} selectedLabel={this.props.activity.filter} /> */}
                <TabComp loading={this.props.store.isFetching || this.props.activity.isComputing} 
                  showFailedCount={this.props.activity.filter.Protocol === PROTOCOL.ANY} 
                  filteredLogs={this.props.activity.filteredLogs} tabData={tabData} 
                  pieChartData={pieChartData}  barChartData={barChartData} 
                  tableData={this.props.activity.filteredLogs} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    store: store.logReducer,
    activity: store.connectionAttemptActivity
  }
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    revalidate,
    filterChange,
    filterPieChart
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionAttempts);
