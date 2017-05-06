/**
 * Created by root on 22/4/17.
 */
exports.VehicleLocationStatus={
    WITH_FLEET:0,
    WITH_PORT:1,
    WITH_MEMBER:2
};
exports.VehicleType={
    BICYCLE:1,
    GEARED_BICYCLE:2,
    PEDAL_ASSIST:3
};



exports.OperationStatus = {
    OPERATIONAL: 1,
    NON_OPERATIONAL: 2,
    DECOMMISSIONED: -1
};

exports.FarePlanStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};

exports.AvailabilityStatus={
    ERROR:-1,
    FULL:1,
    EMPTY:2,
    NORMAL:3
};

exports.MemberStatus = {
    PROSPECTIVE: 0,
    REGISTERED: 1,
    RENEWED: 2,
    CANCELLED: -1,
    SUSPENDED: -2,
    EXPIRED:-3
};