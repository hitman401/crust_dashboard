import { NatType, OS, PROTOCOL } from './FilterTypes';

export const hoursInMilliseconds = (HOURS) => 1 * 1000 * 60 * 60 * HOURS;
export const daysInMilliseconds = (DAYS) => hoursInMilliseconds(24) * DAYS;

export const prepareLogs = (logs) => {
    const osCountMap = {};
    const countryCountMap = {};
    const peerIdMap = [];
    const successfulConnections = [];
    const failedConnections = [];
    let from = new Date;
    const tranformOSName = (osName) => {
        switch (osName.toLowerCase()) {
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

    logs.forEach((log, i) => {
        log.index = i;

        if (!log.hasOwnProperty('udp_hole_punch_result')) {
            log.udp_hole_punch_result = 'Failed';
        }
        if (!log.hasOwnProperty('tcp_hole_punch_result')) {
            log.tcp_hole_punch_result = 'Failed';
        }
        const isSuccess = log.udp_hole_punch_result === 'Succeeded' || log.tcp_hole_punch_result === 'Succeeded' || log.is_direct_successful;
        log.isSuccessful = isSuccess;

        var requesterPeerId = generatePeerPublicInfo(log.peer_requester.name, log.peer_requester.id);
        var responderPeerId = generatePeerPublicInfo(log.peer_responder.name, log.peer_responder.id);
        if (!peerIdMap.includes(requesterPeerId)) {
            peerIdMap.push(requesterPeerId);
        }
        if (!peerIdMap.includes(responderPeerId)) {
            peerIdMap.push(responderPeerId)
        }

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
        peerIdMap,
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
        if (filter.NatType1 === NatType.ANY && filter.NatType2 === NatType.ANY) {
            matches = true;
        } else if ((filter.NatType1 === NatType.ANY && filter.NatType2 !== NatType.ANY)) {
            matches = (filter.NatType2 === log.peer_requester.nat_type || filter.NatType2 === log.peer_responder.nat_type)
        } else if (filter.NatType2 === NatType.ANY && filter.NatType1 !== NatType.ANY) {
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

    const isPeerIdIncluded = (log) => {
        if (!filter.IncludePeerId.length) {
            return true;
        }
        var requesterPeerId = generatePeerPublicInfo(log.peer_requester.name, log.peer_requester.id);
        var responderPeerId = generatePeerPublicInfo(log.peer_responder.name, log.peer_responder.id);
        if (filter.IncludePeerId.includes(requesterPeerId) || filter.IncludePeerId.includes(responderPeerId)) {
            return true;
        }
        else {
            return false;
        }
    }

    const isPeerIdExcluded = (log) => {
        if (!filter.ExcludePeerId.length) {
            return true;
        }
        var requesterPeerId = generatePeerPublicInfo(log.peer_requester.name, log.peer_requester.id);
        var responderPeerId = generatePeerPublicInfo(log.peer_responder.name, log.peer_responder.id);
        if (filter.ExcludePeerId.includes(requesterPeerId) || filter.ExcludePeerId.includes(responderPeerId)) {
            return false;
        }
        else {
            return true;
        }
    }

    return logs.filter(log => {
        return isNatTypeMatching(log) && isOSMatching(log) && isProtocolMatching(log) && isCountryMatching(log) && isPeerIdIncluded(log) && isPeerIdExcluded(log);
    });
};

export const generatePeerPublicInfo = (name, id) => {
    return name + '(' + id + ')'
};

export const formatAreaChart = (logs) => {
    let logCount = 0
    let TCP_HP = 0
    let uDP_HP = 0
    let failed = 0
    let arrayList = [{
        "logCount": "0",
        "TCP Holepunch": 0,
        "UDP Holepunch": 0,
        "Average": 0
    }]
    logs.forEach(log => {
        logCount++
        log.tcp_hole_punch_result === 'Succeeded' ? TCP_HP++ : null;
        log.udp_hole_punch_result === 'Succeeded' ? uDP_HP++ : null;

        log.tcp_hole_punch_result !== 'Succeeded' && log.udp_hole_punch_result !== 'Succeeded' ? failed++ : null;

        let tcp_percent = Math.round((TCP_HP / logCount) * 100)
        let udp_percent = Math.round((uDP_HP / logCount) * 100)
        arrayList.push({
            "logCount": logCount.toString(),
            "TCP Holepunch": tcp_percent,
            "UDP Holepunch": udp_percent,
            "Average": (tcp_percent + udp_percent) / 2
        })
    })
    return ({ data: arrayList, failed: failed });
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