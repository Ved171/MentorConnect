const UserRole = {
  MENTEE: 'Mentee',
  MENTOR: 'Mentor',
  ADMIN: 'Admin',
};

const AvailabilityStatus = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  NOT_ACCEPTING: 'Not Accepting New Mentees',
};

const RequestStatus = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
};

module.exports = {
    UserRole,
    AvailabilityStatus,
    RequestStatus,
};
