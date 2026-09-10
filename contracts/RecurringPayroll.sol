// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RecurringPayroll
/// @notice Owner funds the contract and defines payment schedules.
///         Anyone can trigger a due payment (simulated from the UI with a button).
contract RecurringPayroll {
    address public owner;

    struct Schedule {
        address recipient;
        uint256 amount;
        uint256 period;
        uint256 lastPaidAt;
        bool active;
    }

    struct PaymentRecord {
        uint256 scheduleId;
        address recipient;
        uint256 amount;
        uint256 paidAt;
    }

    Schedule[] private _schedules;
    PaymentRecord[] private _history;

    event Deposited(address indexed from, uint256 amount);
    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed recipient,
        uint256 amount,
        uint256 period
    );
    event ScheduleCancelled(uint256 indexed scheduleId);
    event PaymentExecuted(
        uint256 indexed scheduleId,
        address indexed recipient,
        uint256 amount,
        uint256 paidAt
    );

    error NotOwner();
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidPeriod();
    error UnknownSchedule();
    error ScheduleInactive();
    error TooEarly(uint256 nextPayableAt);
    error InsufficientFunds(uint256 needed, uint256 available);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        if (msg.value == 0) revert InvalidAmount();
        emit Deposited(msg.sender, msg.value);
    }

    function createSchedule(
        address recipient,
        uint256 amount,
        uint256 period
    ) external onlyOwner returns (uint256 scheduleId) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (period == 0) revert InvalidPeriod();

        scheduleId = _schedules.length;
        _schedules.push(
            Schedule({
                recipient: recipient,
                amount: amount,
                period: period,
                lastPaidAt: 0,
                active: true
            })
        );

        emit ScheduleCreated(scheduleId, recipient, amount, period);
    }

    function cancelSchedule(uint256 scheduleId) external onlyOwner {
        Schedule storage schedule = _getSchedule(scheduleId);
        if (!schedule.active) revert ScheduleInactive();
        schedule.active = false;
        emit ScheduleCancelled(scheduleId);
    }

    /// @notice Pays a schedule if it is due. First payment can run immediately.
    function executePayment(uint256 scheduleId) external {
        Schedule storage schedule = _getSchedule(scheduleId);
        if (!schedule.active) revert ScheduleInactive();

        uint256 payableAt = schedule.lastPaidAt == 0
            ? block.timestamp
            : schedule.lastPaidAt + schedule.period;

        if (block.timestamp < payableAt) {
            revert TooEarly(payableAt);
        }
        if (address(this).balance < schedule.amount) {
            revert InsufficientFunds(schedule.amount, address(this).balance);
        }

        schedule.lastPaidAt = block.timestamp;
        _history.push(
            PaymentRecord({
                scheduleId: scheduleId,
                recipient: schedule.recipient,
                amount: schedule.amount,
                paidAt: block.timestamp
            })
        );

        (bool ok, ) = schedule.recipient.call{value: schedule.amount}("");
        if (!ok) revert TransferFailed();

        emit PaymentExecuted(
            scheduleId,
            schedule.recipient,
            schedule.amount,
            block.timestamp
        );
    }

    function getSchedules() external view returns (Schedule[] memory) {
        return _schedules;
    }

    function getHistory() external view returns (PaymentRecord[] memory) {
        return _history;
    }

    function scheduleCount() external view returns (uint256) {
        return _schedules.length;
    }

    function historyCount() external view returns (uint256) {
        return _history.length;
    }

    function nextPayableAt(uint256 scheduleId) external view returns (uint256) {
        Schedule storage schedule = _getSchedule(scheduleId);
        if (schedule.lastPaidAt == 0) return block.timestamp;
        return schedule.lastPaidAt + schedule.period;
    }

    function _getSchedule(
        uint256 scheduleId
    ) private view returns (Schedule storage schedule) {
        if (scheduleId >= _schedules.length) revert UnknownSchedule();
        schedule = _schedules[scheduleId];
    }
}
