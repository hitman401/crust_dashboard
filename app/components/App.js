import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Layout, Menu, Icon, DatePicker, Progress, Alert } from "antd";
import { Link, Route } from "react-router-dom";
import moment from "moment";

import logo from "../assets/images/logo.svg";
// import Dashboard from "../pages/Dashboard";
// import NatType from "../pages/NatType";
import ConnectionAttempts from "../pages/ConnectionAttempts";
// import Protocol from "../pages/Protocol";
import { hoursInMilliseconds, daysInMilliseconds } from '../redux/utils';
import { fetchLogs, filterByRange } from '../redux/dispatcher/logs_action';

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;

const dateFormat = "YYYY-MM-DD";

class App extends Component {

  constructor() {
    super();
    this.state = {
      collapsed: false,
      dateFilterIndex: 5
    };
  }

  toggle() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  componentDidMount() {
    this.props.fetchLogs();
  }

  filterByHour() {
    this.setState({
      dateFilterIndex: 1
    });
    const now = new Date().getTime();
    const hour = hoursInMilliseconds(1);
    this.props.filterByRange(now - hour, now);
  }

  filterByDay() {
    this.setState({
      dateFilterIndex: 2
    });

    const now = new Date().getTime();
    const hour = daysInMilliseconds(1);
    this.props.filterByRange(now - hour, now);
  }

  filterByWeek() {
    this.setState({
      dateFilterIndex: 3
    });

    const now = new Date().getTime();
    const hour = daysInMilliseconds(7);
    this.props.filterByRange(now - hour, now);
  }

  filterByMonth() {
    this.setState({
      dateFilterIndex: 4
    });
    const now = new Date().getTime();
    const hour = daysInMilliseconds(30);
    this.props.filterByRange(now - hour, now);
  }

  filterNone() {
    this.setState({
      dateFilterIndex: 5
    });
    this.props.filterByRange(-1);
  }

  // TODO
  // filterCustomRange() {
  //   this.props.filterByRange(from, to);
  // }

  render() {
    window.prop = this.props;
    // if (this.props.store.isFetching) {
    //   return <div>LOADING...!!!</div>
    // }
    return (
      <div>
        {this.props.store.error ? <Alert banner message={this.props.store.error} type="error" showIcon closable /> : null}
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
            width={"256px"}
            className="main-slider"
          >
            <div className="logo">
              <div className="logo-b">
                <img className="logo-media" src={logo} alt="logo" />
                <h1 className="logo-desc">CRUST TEST</h1>
              </div>
            </div>
            <Menu mode="inline" defaultSelectedKeys={["4"]}>
              {/*<Menu.Item key="1">
              <Link to="/">
                <span id="item">
                  <Icon type="dashboard" />
                  <span>Dashboard</span>
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/nat">
                <span id="item">
                  <Icon type="retweet" />
                  <span>NAT Type</span>
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/protocol">
                <span id="item">
                  <Icon type="arrow-up" />
                  <span>Protocol</span>
                </span>
              </Link>
            </Menu.Item> */}
              <Menu.Item key="4">
                <Link to="/">
                  <span id="item">
                    <Icon type="line-chart" />
                    <span>Connection Attempts</span>
                  </span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout className="main-layout">
            <Header className="main-layout-head">
              <Icon
                className="trigger"
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={() => this.toggle()}
                style={{ fontSize: '18px', color: '#000000' }}
              />
              <div className="main-head-nav">
                {/* maybe these className attributes could be removed
              <a  href="#" onClick={() => this.filterByHour()}>Hour</a>
              <a  href="#" onClick={() => this.filterByDay()}>Day</a>
              <a  href="#" onClick={() => this.filterByWeek()}>Week</a>
              <a  href="#" onClick={() => this.filterByMonth()}>Month</a>*/}
                <a>
                All Time
              </a>
              <div className="main-head-nav-date">
                  <RangePicker
                    value={[
                      moment(new Date(this.props.store.dateRange.allTime.from), dateFormat),
                      moment(new Date(this.props.store.dateRange.allTime.to), dateFormat)
                    ]}
                    format={dateFormat} disabled
                  />
                </div>
              </div>
            </Header>
            {this.props.store.logs.length === 0 ? <div className="main-layout-content">No data available</div> : (<Content className="main-layout-content">
              <div className="main-progress" style={{ display: (!this.props.store.paging.completed || this.props.activity.isComputing) ? 'block' : 'none' }}>
                {
                  (this.props.store.paging.done <= 100) || this.props.activity.isComputing ? (
                    <Progress
                      percent={this.props.activity.isComputing ? 100 : this.props.store.paging.done}
                      strokeLinecap="square"
                      strokeWidth="3px"
                      status="active"
                      showInfo={false}
                      strokeColor="#FA541C"
                    />
                  ) : null
                }
              </div>
              <Route path="/" exact component={ConnectionAttempts} />
              {/* <Route path="/nat" component={NatType} />
            <Route path="/protocol" component={Protocol} />
            <Route path="/connect" component={ConnectionAttempts} /> */}
            </Content>)}
          </Layout>
        </Layout>
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
    fetchLogs,
    filterByRange
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
