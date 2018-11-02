export const ConnectionResult = {
    NONE: 0,
    SUCCESS: 1,
    FAILURE: 2
};

export const NatType = {
    ANY: 'Any',
    EDM: 'EDM',
    EIM: 'EIM'
}

export const OS = {
    ANY: 'Any',
    Windows: 'Windows',
    OSX: 'MacOS',
    LINUX: 'Linux'
}

export const PROTOCOL = {
    DIRECT: 'DIRECT',
    UDP_HP: 'UDP_HP',
    TCP_HP: 'TCP_HP' 
}

export const Filter = {
    NatType1: NatType.ANY,
    NatType2: NatType.ANY,
    OSType1: OS.ANY,
    OSType2: OS.ANY,
    CountryType1: OS.ANY,
    CountryType2: OS.ANY,
    IncludePeerId: [],
    ExcludePeerId: [],
    Protocol:{
        tcpHp: true,
        udpHp: true,
        direct: true 
    }
}
