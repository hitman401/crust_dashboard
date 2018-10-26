import React, { Component } from "react";
import { Tag } from "antd";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Action from '../redux/ActionType';
import { PROTOCOL } from '../redux/FilterTypes';
import { MOD_NAME } from '../redux/reducers/ConnectionAttempt/activity';
import {filterPieChart} from '../redux/dispatcher/logs_action';

function names(name) {
    switch (name) {
        case PROTOCOL.TCP_HP:
            return "TCP HP";
        case PROTOCOL.UDP_HP:
            return "UDP HP";
        case PROTOCOL.DIRECT:
            return "Direct";
    }
}

const { CheckableTag } = Tag;

class TagButton extends Component {
    state = { checked: true };

    componentDidMount() {
        const filter = {...this.props.activity.filter.Protocol};
        let checked = false;
        switch(this.props.name) {
            case PROTOCOL.TCP_HP:
                checked = filter.tcpHp;
                break;
            case PROTOCOL.UDP_HP:
                checked = filter.udpHp;
                break;
            case PROTOCOL.DIRECT:
                checked = filter.direct;
                break;
        }
        this.setState({ checked });
    }

    handleChange = (checked) => {
        const filter = {...this.props.activity.filter.Protocol}
        switch(this.props.name) {
            case PROTOCOL.TCP_HP:
                filter.tcpHp = checked;
                break;
            case PROTOCOL.UDP_HP:
                filter.udpHp = checked;
                break;
            case PROTOCOL.DIRECT:
                filter.direct = checked;
                break;
        }
        if(filter.tcpHp || filter.udpHp || filter.direct) {
            this.setState({ checked });
            this.props.filterPieChart(MOD_NAME, Action.FILTER_BY_PROTOCOL, this.props.activity.filteredLogs, filter);        
        } 
    }

    render() {
        const { name } = this.props
        return (
            <CheckableTag  checked={this.state.checked} onChange={(c) => this.handleChange(c)}>{names(name)}</CheckableTag>
        )
    }
}

const mapStateToProps = (store) => {
    return {
      activity: store.connectionAttemptActivity
    }
  };

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
      filterPieChart
    }, dispatch);
};
  
export default connect(mapStateToProps, mapDispatchToProps)(TagButton);
