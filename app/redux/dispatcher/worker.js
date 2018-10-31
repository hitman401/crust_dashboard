import Register from 'promise-worker/register';
const customWorker = (msg) => {    
    const NatType = {
        ANY: 'Any',
        EDM: 'EDM',
        EIM: 'EIM'
    }

    const OS = {
        ANY: 'Any',
        Windows: 'Windows',
        OSX: 'MacOS',
        LINUX: 'Linux'
    }

    // const PROTOCOL = {
    //     ANY: 'Any',
    //     // TCP_DIRECT: 'TCP_DIRECT',
    //     UDP_HP: 'UDP_HP',
    //     TCP_HP: 'TCP_HP'
    // }

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

    const generatePeerPublicInfo = (name, id) => {
        return name + '(' + id + ')'
    };


    const isNatTypeMatching = (log, filter) => {
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

    const isOSMatching = (log, filter) => {
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

    // const isProtocolMatching = (log) => {
    //     const { tcpHp, udpHp, direct } = filter.Protocol;
    //     if (tcpHp && udpHp && direct) {
    //         return true;
    //     }
    //     return (direct && log.is_direct_successful) ||
    //         (tcpHp && log.tcp_hole_punch_result === 'Succeeded') ||
    //         (udpHp && log.udp_hole_punch_result === 'Succeeded');
    // }

    const isCountryMatching = (log, filter) => {
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

    const isPeerIncluded = (arr, requesterPeerId, responderPeerId) => {
        return arr.length === 0 ? true : (arr.indexOf(requesterPeerId) > -1 || arr.indexOf(responderPeerId) > -1);
    }

    const isPeerExcluded = (arr, requesterPeerId, responderPeerId) => {
        return arr.length === 0 ? false : (arr.indexOf(requesterPeerId) > -1 || arr.indexOf(responderPeerId) > -1);
    }

    const prepareLogs = (logs, filter) => {
        const osCountMap = {};
        const countryCountMap = {};
        const peerIdMap = [];
        const successfulConnections = [];
        const failedConnections = [];
        let tcpHpCount=0;
        let udpHpCount=0;
        let directCount=0;
        let from = new Date;
        const activityTab = {
            logs: [],
            tcpHpCount: 0,
            udpHpCount: 0,
            directCount: 0,
            successfulConnections: [],
            failedConnections: []
        }
    
        logs.forEach((log, i) => {
            log.index = log.hasOwnProperty("index") ? log.index : logs.length - i;
            const requesterPeerId = generatePeerPublicInfo(log.peer_requester.name, log.peer_requester.id);
            const responderPeerId = generatePeerPublicInfo(log.peer_responder.name, log.peer_responder.id);
            const isFilteredPassed = isNatTypeMatching(log, filter) 
                && isOSMatching(log, filter) 
                // && isProtocolMatching(log) 
                && isCountryMatching(log, filter)
                && isPeerIncluded(filter.IncludePeerId, requesterPeerId, responderPeerId)
                && !isPeerExcluded(filter.ExcludePeerId, requesterPeerId, responderPeerId);
            log.tcp_hole_punch_result === 'Succeeded' ? tcpHpCount++ : null;
            log.udp_hole_punch_result === 'Succeeded' ? udpHpCount++ : null;
            log.is_direct_successful? directCount++ : null;

            const isSuccess = log.udp_hole_punch_result === 'Succeeded' || log.tcp_hole_punch_result === 'Succeeded' || log.is_direct_successful;
            log.isSuccessful = isSuccess;

            if (isFilteredPassed) {
                log.tcp_hole_punch_result === 'Succeeded' ? activityTab.tcpHpCount++ : null;
                log.udp_hole_punch_result === 'Succeeded' ? activityTab.udpHpCount++ : null;
                log.is_direct_successful? activityTab.directCount++ : null;
                (log.isSuccessful ? activityTab.successfulConnections : activityTab.failedConnections).push(log);
                activityTab.logs.push(log);
            }
    
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
        const osCount = osCountMap;
        const countriesCount = countryCountMap;
        const peerIds = peerIdMap;
        return {
            logs,
            tcpHpCount,
            udpHpCount,
            directCount,
            osCount,
            countriesCount,
            peerIds,
            successfulConnections,
            failedConnections,
            dateRange: {
                from,
                to: new Date
            },
            activityTab
        };
    };

    const filterPieData = (logs, filter) => {
        let total = 0
        let success = 0
        logs.filter(log => {
            total++;
            const tcpResult = filter.tcpHp ? log.tcp_hole_punch_result === 'Succeeded' : false;
            const udpResult = filter.udpHp ? log.udp_hole_punch_result === 'Succeeded' : false;
            const directResult = filter.direct ? log.is_direct_successful : false;
            if (tcpResult || udpResult || directResult) {
                success++;
            }
        })
        return {
            data: {
                total,
                success
            },
            filter
        };
    }

    const {type, payload} = msg;
    switch(type) {
        case 'PREPARE_LOGS':
        case 'REVALIDATE':
            return prepareLogs(payload.logs, payload.filter);
        
        case 'FILTER_PIE_CHART':
            return filterPieData(payload.logs, payload.filter);
        
        case 'FILTER_NAME':
            return payload.data.filter(item => item.search(new RegExp(payload.search,"i")) !== -1)
        default:
        return;
    }
};

Register(customWorker);