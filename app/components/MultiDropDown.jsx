import React, { Component } from "react";
import { Select, Row, Col, Spin } from "antd";
// import debounce from 'lodash/debounce';
import PromiseWorker from 'promise-worker';

const worker = new Worker('../redux/dispatcher/worker.js');
const promiseWorker = new PromiseWorker(worker);

const Option = Select.Option;

class MultiDropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            value: [],
            fetching: false,
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.fetching) {
           promiseWorker.postMessage({
                type: 'FILTER_NAME',
                payload: {
                    data: this.props.items,
                    search: nextState.value
                }
            }).then((res) => {
                this.setState({
                    data: res.slice(1,100),
                    fetching: false
                });
            })
        }
    }

    fetchUser = (value) => {
        value = value.trim();
        if (value.length > 0) {
            this.setState({
                fetching: true,
            });
        }
        this.setState({
            data: [],
            value: value
        });
    }
    
    clear = () => {
        this.setState({
            data: [],
            value: []
        });
    }

    handleChange(value) {
        this.props.filterAction(this.props.mod, this.props.actionType, value)
        this.setState({
            data: [],
        });
    }
    render() {
        const { fetching, data } = this.state;

        return (
            <Col className="filters-2-i" span={12}>
                <Col className="filters-2-i-title" span={6}>{this.props.type}</Col>
                <Select
                    className="filters-2-i-select"
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={(value) => this.fetchUser(value)}
                    onChange={(item) => this.handleChange(item)}
                    onBlur={() => this.clear()}
                >
                    {data.map(d => <Option key={d}>{d}</Option>)}
                </Select>
            </Col>
        )
    }
}
export default MultiDropDown;
