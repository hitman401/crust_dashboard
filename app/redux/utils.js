import { NatType, OS, PROTOCOL } from './FilterTypes';

export const hoursInMilliseconds = (HOURS) => 1 * 1000 * 60 * 60 * HOURS;
export const daysInMilliseconds = (DAYS) => hoursInMilliseconds(24) * DAYS;

export const prepareLogs = (logs) => {
    const osCountMap = {};
    const countryCountMap = {};
    const successfulConnections = [];
    const failedConnections = [];
    let from = new Date;
    const tranformOSName = (osName) => {
        switch(osName.toLowerCase()) {
            case 'linux':
                return OS.LINUX;
            case 'macos':
                return OS.OSX;
            case 'windows':
                return OS.Windows;  
            default:
                return osName;
        }
    };

    logs.forEach(log => {
        const isSuccess = log.utp_hole_punch_result === 'Succeeded' || log.tcp_hole_punch_result === 'Succeeded';
        log.isSuccessful = isSuccess;
        log.peer_requester.os = tranformOSName(log.peer_requester.os);
        log.peer_responder.os = tranformOSName(log.peer_responder.os);
        if (!osCountMap[log.peer_requester.os]) {
            osCountMap[log.peer_requester.os] = 0;
        }
        if (!osCountMap[log.peer_responder.os]) {
            osCountMap[log.peer_responder.os] = 0;
        }
        osCountMap[log.peer_requester.os] = osCountMap[log.peer_requester.os] + 1;
        osCountMap[log.peer_responder.os] = osCountMap[log.peer_responder.os] + 1; 
        if (!countryCountMap[log.peer_requester.geo_info.country_name]) {
            countryCountMap[log.peer_requester.geo_info.country_name] = 0;
        }
        if (!countryCountMap[log.peer_responder.geo_info.country_name]) {
            countryCountMap[log.peer_responder.geo_info.country_name] = 0;
        }
        countryCountMap[log.peer_requester.geo_info.country_name] = countryCountMap[log.peer_requester.geo_info.country_name] + 1;
        countryCountMap[log.peer_responder.geo_info.country_name] = countryCountMap[log.peer_responder.geo_info.country_name] + 1;
        if (from > new Date(log.createdAt)) {
            from = new Date(log.createdAt);
        }
        if (typeof(log.peer_requester.nat_type) !== 'string') {
            log.peer_requester.nat_type = 'EDM_RANDOM'
        }
        if (typeof(log.peer_responder.nat_type) !== 'string') {
            log.peer_responder.nat_type = 'EDM_RANDOM'
        }
        (isSuccess ? successfulConnections : failedConnections).push(log);
    });
    return {
        logs,
        osCountMap,
        countryCountMap,
        successfulConnections,
        failedConnections,
        dateRange: {
            from,
            to: new Date
        }
    };
};


/**
 * 
 * @param {*} logs 
 * @param {*} from - local date 
 * @param {*} to - local date
 */
export const filterLogs = (logs, from, to) => {
    const filteredLogs = logs.filter(log => {
        log.createdAt = new Date(log.createdAt);
        return log.createdAt >= from && log.createdAt <= to;
    });
    return prepareLogs(filteredLogs);
};

export const applyFilter = (logs, filter) => {
    const isNatTypeMatching = (log) => {
        let matches = false;
        if (filter.NatType1 === NatType.ANY && filter.NatType2 === NatType.ANY){
            matches = true;
        } else if ((filter.NatType1 === NatType.ANY && filter.NatType2 !== NatType.ANY) ){
            matches = (filter.NatType2 === log.peer_requester.nat_type || filter.NatType2 === log.peer_responder.nat_type)
        } else if (filter.NatType2 === NatType.ANY && filter.NatType1 !== NatType.ANY){
            matches = (filter.NatType1 === log.peer_requester.nat_type || filter.NatType1 === log.peer_responder.nat_type)
        } else if (filter.NatType1 !== NatType.ANY && filter.NatType2 !== NatType.ANY) {
            matches = (log.peer_requester.nat_type === filter.NatType1 && log.peer_responder.nat_type === filter.NatType2) ||
                (log.peer_requester.nat_type === filter.NatType2 && log.peer_responder.nat_type === filter.NatType1)
        }
        return matches;
    }
    
    const isOSMatching = (log) => {
        let matches = false;
        if (filter.OSType1 === OS.ANY && filter.OSType2 === OS.ANY)
            matches = true;
        else if ((filter.OSType1 === OS.ANY && filter.OSType2 !== OS.ANY))
            matches = (filter.OSType2 === log.peer_requester.os || filter.OSType2 === log.peer_responder.os)
        else if ((filter.OSType2 === OS.ANY && filter.OSType1 !== OS.ANY))
            matches = (filter.OSType1 === log.peer_requester.os || filter.OSType1 === log.peer_responder.os)
        else if (filter.OSType1 !== OS.ANY && filter.OSType2 !== OS.ANY) 
            matches = (log.peer_requester.os === filter.OSType1 && log.peer_responder.os === filter.OSType2) ||
                (log.peer_requester.os === filter.OSType2 && log.peer_responder.os === filter.OSType1)
        return matches;
    }

    const isProtocolMatching = (log) => {
        if (filter.Protocol === PROTOCOL.ANY) {
            return true;
        }
        return (filter.Protocol === PROTOCOL.TCP_DIRECT && log.is_direct_successful) ||
            (filter.Protocol === PROTOCOL.TCP_HP && log.tcp_hole_punch_result === 'Succeeded') ||
            (filter.Protocol === PROTOCOL.UTP_HP && log.utp_hole_punch_result === 'Succeeded');
    }

    const isCountryMatching = (log) => {
        const ANY = OS.ANY;
        if (filter.CountryType1 === ANY && filter.CountryType2 === ANY)
            return true;
        else if ((filter.CountryType1 === ANY && filter.CountryType2 !== ANY))
            return (filter.CountryType2 === log.peer_requester.geo_info.country_name || filter.CountryType2 === log.peer_responder.geo_info.country_name)
        else if ((filter.CountryType2 === ANY && filter.CountryType1 !== ANY))
            return (filter.CountryType1 === log.peer_requester.geo_info.country_name || filter.CountryType1 === log.peer_responder.geo_info.country_name)
        else if (filter.CountryType1 !== ANY && filter.CountryType2 !== ANY)
            return (log.peer_requester.geo_info.country_name === filter.CountryType1 && log.peer_responder.geo_info.country_name === filter.CountryType2) ||
                (log.peer_requester.geo_info.country_name === filter.CountryType2 && log.peer_responder.geo_info.country_name === filter.CountryType1)
    }
    
    return logs.filter(log => {
        return isNatTypeMatching(log) && isOSMatching(log) && isProtocolMatching(log) && isCountryMatching(log);
    });
};

export const formatAreaChart = (logs) => {
    let logCount = 0
    let TCP_HP = 0
    let uTP_HP = 0
    let arrayList = []
    let failed = 0
    logs.forEach(log => {
        logCount++
        log.tcp_hole_punch_result === 'Succeeded' ? TCP_HP++ : null;
        log.utp_hole_punch_result === 'Succeeded' ? uTP_HP++ : null;
        log.tcp_hole_punch_result !== 'Succeeded' && log.utp_hole_punch_result !== 'Succeeded' ? failed++ : null;

        let tcp_percent = Math.round((TCP_HP/logCount)*100)
        let udp_percent = Math.round((uTP_HP/logCount)*100)
        arrayList.push({
          "logCount": logCount.toString(),
              "TCP_HP": tcp_percent,
              "UDP_HP": udp_percent,
              "Average": (tcp_percent+udp_percent)/2
          })
      })
      return ({data:arrayList,failed:failed});
  };
  