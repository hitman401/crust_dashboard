import React, { Component } from "react";
import { Row, Col, Card, Icon, Skeleton } from "antd";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import "./Dashboard.css";
import { filterByConnectionResult, revalidate, filterChange } from '../redux/dispatcher/logs_action';
//import DropDown from "../components/SubComponents/DropDownRender";
import TabComp from "../components/TabComp";
import { formatAreaChart, isEquivalent } from "../redux/utils";
import { MOD_NAME } from "../redux/reducers/ConnectionAttempt/activity";
import { PROTOCOL } from '../redux/FilterTypes';

class ConnectionAttempts extends Component {
  constructor(props) {
    super(props);
    // this.props.revalidate(mods.CON_ACT_,this.props.store.filteredConnectionResults);
  }


  // componentDidMount() {
  //   this.props.revalidate(this.props.store.filteredConnectionResults, this.props.activity.filter);
  // }

  componentWillUpdate(nextProps) {
    if (!isEquivalent(this.props.activity.filter, nextProps.activity.filter)) {
      this.props.revalidate(this.props.store.filteredConnectionResults, nextProps.activity.filter);
    }

    //Everytime the main reducer is updated we update our tab filters  
    if (!isEquivalent(this.props.store.filteredConnectionResults, nextProps.store.filteredConnectionResults )) {
      this.props.revalidate(nextProps.store.filteredConnectionResults, this.props.activity.filter);
    }
  }

  render() {
    const tabData = {
      "contents": ["NAT Type", "Protocol", "O.S.", "Country"],
      "data": this.props.store.filteredConnectionResults,
      "mod": MOD_NAME,
      "filterAction": this.props.filterChange,
      "labels": this.props.store.filteredLogs,
      "selectedLabel": this.props.activity.filter
    }

    return (
      <div className="page-1">
        <span className="page-1-head">
        <Skeleton loading={!this.props.store.paging.completed} active animate>
          <h1 className="page-1-head-title">Connection Attempts
          {/* <Icon type="info-circle" theme="outlined" style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.45)' }} /> */}
          </h1>
          <div className="page-1-head-info">
           Want to participate in the test programme? We've got all the instructions you'll need on our community forum. Just <a href="https://safenetforum.org/" target="_blank">click here</a> to get started. 
          </div>

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
              {/* <DropDown contents={["NAT Type", "Protocol", "O.S.", "Country"]} data={this.props.store.filteredConnectionResults} mod={MOD_NAME} filterAction={this.props.filterChange}
                labels={this.props.store.filteredLogs} selectedLabel={this.props.activity.filter} /> */}
              <Skeleton loading={!this.props.store.paging.completed} active animate>            
                <TabComp  showFailedCount={this.props.activity.filter.Protocol === PROTOCOL.ANY} filteredLogs={this.props.activity.filteredLogs} tabData={tabData} chartData={formatAreaChart(this.props.activity.filteredLogs)} tableData={this.props.activity.filteredLogs} />
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
