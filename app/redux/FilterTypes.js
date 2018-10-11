export const ConnectionResult = {
    NONE: 0,
    SUCCESS: 1,
    FAILURE: 2
};

export const NatType = {
    ANY: 'Any',
    EDM: 'EDM',
    EIM: 'EIM',
    EDM_RANDOM: 'EDM_RANDOM'
}

export const OS = {
    ANY: 'Any',
    Windows: 'Windows',
    OSX: 'MacOS',
    LINUX: 'Linux'
}

export const PROTOCOL = {
    ANY: 'Any',
    // TCP_DIRECT: 'TCP_DIRECT',
    UTP_HP: 'UDP_HP',
    TCP_HP: 'TCP_HP'
}

export const Filter = {
    NatType1: NatType.ANY,
    NatType2: NatType.ANY,
    OSType1: OS.ANY,
    OSType2: OS.ANY,
    CountryType1: OS.ANY,
    CountryType2: OS.ANY,
    Protocol: PROTOCOL.ANY
}
