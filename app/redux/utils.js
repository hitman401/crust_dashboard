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
        if (!log.hasOwnProperty('udp_hole_punch_result')) {
            log.udp_hole_punch_result = 'Failed';
        }
        if (!log.hasOwnProperty('tcp_hole_punch_result')) {
            log.tcp_hole_punch_result = 'Failed';
        }
        const isSuccess = log.udp_hole_punch_result === 'Succeeded' || log.tcp_hole_punch_result === 'Succeeded';
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
            (filter.Protocol === PROTOCOL.UDP_HP && log.udp_hole_punch_result === 'Succeeded');
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


import PromiseWorker from 'promise-worker';
const worker = new Worker('./worker.js');
const promiseWorker = new PromiseWorker(worker);


export const formatAreaChart = (logs) => {
    return promiseWorker.postMessage({type: 'CH_FIL', payload: logs});
};

  export const isEquivalent = (a, b) => {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}