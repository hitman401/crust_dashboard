import React, { Component } from "react";
import { Row, Col, Icon, Menu, Dropdown, Button } from "antd";
import { DropDownItems } from "./DropDownItems"
import { PROTOCOL, NatType, OS } from "../../redux/FilterTypes";
import Action from '../../redux/ActionType';

const getCustomMenu = (menuOpts) => {
    return (
        <Menu className="_menu-item">{menuOpts}</Menu>
    );
}

class DropDown extends Component {

    constructor(props) {
        super(props);
        this.tabContent = this.props.contents;
    }

    protocolMenu() {
        return (
            <Menu className="_menu-item">
                <Menu.Item key="menu-proto1">
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_BY_PROTOCOL, PROTOCOL.ANY)}>{PROTOCOL.ANY}</a>
                </Menu.Item>
                {/* <Menu.Item key="menu-proto2">
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_BY_PROTOCOL, PROTOCOL.TCP_DIRECT)}>TCP Direct</a>
                </Menu.Item> */}
                <Menu.Item key="menu-proto3">
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_BY_PROTOCOL, PROTOCOL.UDP_HP)}>UDP Holepunch</a>
                </Menu.Item>
                <Menu.Item key="menu-proto4">
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_BY_PROTOCOL, PROTOCOL.TCP_HP)}>TCP Holepunch</a>
                </Menu.Item>
            </Menu>
        )
    }
    
    natMenu1() {
        let items = this.props.labels.natTypes
        let itemList = items.map((nat, k) => {
            return (

                <Menu.Item key={`menu-nat1-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_NAT_TYPE1, nat)}>{nat}</a>
                </Menu.Item>
            )
        });
        return itemList;
    }

    natMenu2() {
        let items = this.props.labels.natTypes
        let itemList = items.map((nat, k) => {
            return (
                <Menu.Item key={`menu-nat2-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_NAT_TYPE2, nat)}>{nat}</a>
                </Menu.Item>
            )
        });
        return itemList;
    }

    osMenu1() {
        let items = this.props.labels.osList
        let itemList = items.map((os, k) => {
            return (
                <Menu.Item key={`menu-os1-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_OS_TYPE1, os)}>{os}</a>
                </Menu.Item>
            )
        });
        return itemList;
    }

    osMenu2() {
        let items = this.props.labels.osList
        let itemList = items.map((os, k) => {
            return (
                <Menu.Item key={`menu-os2-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_OS_TYPE2, os)}>{os}</a>
                </Menu.Item>
            )
        });
        return itemList;
    }

    countryMenu1() {
        let countries = Object.keys(this.props.labels.countriesCount)
        countries.sort();
        countries.unshift("Any");
        let countryList = countries.map((country, k) => {
            return (
                <Menu.Item key={`menu-country1-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_COUNTRY_TYPE1, country)}>{country}</a>
                </Menu.Item>
            )
        });
        return countryList;
    }


    countryMenu2() {
        let countries = Object.keys(this.props.labels.countriesCount);
        countries.sort();
        countries.unshift("Any");
        let countryList = countries.map((country, k) => {
            return (
                <Menu.Item key={`menu-country2-${k}`}>
                    <a onClick={() => this.props.filterAction(this.props.data, this.props.mod, Action.FILTER_COUNTRY_TYPE2, country)}>{country}</a>
                </Menu.Item>
            )
        });
        return countryList;
    }

    render() {
        const countryMenu1 = this.countryMenu1();
        const countryMenu2 = this.countryMenu2();
        const osMenu1 = this.osMenu1();
        const osMenu2 = this.osMenu2();
        const natMenu1 = this.natMenu1();
        const natMenu2 = this.natMenu2();

        const getProtocolDisplayName = () => {
            switch (this.props.selectedLabel.Protocol) {
                case PROTOCOL.TCP_HP:
                    return 'TCP Holepunch';
                case PROTOCOL.UDP_HP:
                    return 'UDP Holepunch';
                default:
                    return PROTOCOL.ANY;
            }
        };
        return (
            <div className="dropdown-render">
                <Row gutter={24}>
                    <DropDownItems type={this.tabContent[0]} menu1={(getCustomMenu(natMenu1))} menu2={(getCustomMenu(natMenu2))}
                        selected1={this.props.selectedLabel.NatType1} selected2={this.props.selectedLabel.NatType2} />

                    <DropDownItems type={this.tabContent[1]} menu1={this.protocolMenu()} menu2={""}
                        selected1={getProtocolDisplayName()} />
                </Row>

                <Row gutter={24}>
                    <DropDownItems type={this.tabContent[2]} menu1={(getCustomMenu(osMenu1))} menu2={(getCustomMenu(osMenu2))}
                        selected1={this.props.selectedLabel.OSType1} selected2={this.props.selectedLabel.OSType2} />

                    <DropDownItems type={this.tabContent[3]} menu1={(getCustomMenu(countryMenu1))} menu2={(getCustomMenu(countryMenu2))}
                        selected1={this.props.selectedLabel.CountryType1} selected2={this.props.selectedLabel.CountryType2} />
                </Row>
            </div>
        )
    }
}
export default DropDown;
