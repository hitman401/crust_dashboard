import React, { Component } from "react";
import { Row, Col, Card, Icon, Skeleton } from "antd";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import "./Dashboard.css";
import { filterByConnectionResult, revalidate, filterChange } from '../redux/dispatcher/logs_action';
//import DropDown from "../components/SubComponents/DropDownRender";
import TabComp from "../components/TabComp";
import { formatAreaChart } from "../redux/utils"
import { MOD_NAME } from "../redux/reducers/ConnectionAttempt/activity"
import Popup from "../components/popup"
class ConnectionAttempts extends Component {
  constructor(props) {
    super(props);
    // this.props.revalidate(mods.CON_ACT_,this.props.store.filteredConnectionResults);
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   //initially if returns false since the state isn't changed.
  //   //we set the initial state using constructor and this function for later changes
  //   if (this.props.store.filteredConnectionResults != nextProps.store.filteredConnectionResults) {
  //     this.props.revalidate(mods.CON_ACT_,nextProps.store.filteredConnectionResults);
  //   }
  // }
  
  componentDidMount() {
    this.props.revalidate(this.props.store.filteredConnectionResults);
  }

  render() {
    const tabData = {
      "contents": ["NAT Type", "Protocol", "O.S.", "Country"],
      "data": this.props.store.filteredConnectionResults,
      "mod": MOD_NAME,
      "filterAction": this.props.filterChange,
      "labels": this.props.store.filteredLogs,
      "selectedLabel": this.props.activity.filter,
    }

    return (
      <div className="page-1">
        <span className="page-1-head">
        <Skeleton loading={!this.props.store.paging.completed} active animate>
          <h1 className="page-1-head-title">Connection Attempts
          <Popup content={"add extra info here"}/>
          </h1>
          <div className="page-1-head-opts">
            {/* <h3 className="page-1-head-opts-title">Connection result:</h3> */}
            {/* <ButtonGroup selectedIndex={this.props.store.connectionResultFilter}
              changeFilter={this.props.filterByConnectionResult} /> */}
          </div>
          </Skeleton>
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
              <Skeleton loading={!this.props.store.paging.completed} active animate>
                <TabComp filteredLogs={this.props.activity.filteredLogs}   tabData={tabData} failedCount={this.props.store.filteredLogs.failedConnections.length} chartData={formatAreaChart(this.props.activity.filteredLogs)} tableData={this.props.activity.filteredLogs} />
              </Skeleton>
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
    filterByConnectionResult,
    revalidate,
    filterChange
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionAttempts);
