import React, { Component } from "react";
import { Table} from "antd";

import columns from '../assets/tableData/tableColumn';


function filterLogs(rawData){
  const dataSource = [];
  {/* FIXME: Something here */}
  rawData.forEach(log => {
    dataSource.push({
        key: log.logDataHash.substring(0, 6),
        num: log.logDataHash.substring(0, 6),
        // direct: log.is_direct_successful ? "Yes" : "No",
        tcp_hp: log.tcp_hole_punch_result === "Succeeded" ? "Yes" : "Fail",
        utp_hp: log.utp_hole_punch_result === "Succeeded" ? "Yes" : "Fail",
        nat_type: [log.peer_requester.nat_type, log.peer_responder.nat_type],
        os: [log.peer_requester.os, log.peer_responder.os],
        country: [log.peer_requester.geo_info.country_name, log.peer_responder.geo_info.country_name],
        isSuccessful: log.isSuccessful
    });
  });
  return dataSource
}

class Tables extends Component {
  render() {
    const {dataSource} = this.props;
    const filterData=filterLogs(dataSource)
    return (
      <div>
        <Table
          dataSource={filterData}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default Tables;
