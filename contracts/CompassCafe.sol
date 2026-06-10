// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CompassCafe {
    mapping(address => uint256) public userBrews;
    mapping(address => uint256) public userTables;
    mapping(address => uint256) public userCorners;

    uint256 public totalBrews;
    uint256 public totalTables;
    uint256 public totalCorners;

    event CupBrewed(address indexed user, uint256 userBrews, uint256 totalBrews);
    event TableSet(address indexed user, uint256 userTables, uint256 totalTables);
    event CornerWarmed(address indexed user, uint256 userCorners, uint256 totalCorners);

    function brewCup() external {
        unchecked {
            userBrews[msg.sender] += 1;
            totalBrews += 1;
        }

        emit CupBrewed(msg.sender, userBrews[msg.sender], totalBrews);
    }

    function setTable() external {
        unchecked {
            userTables[msg.sender] += 1;
            totalTables += 1;
        }

        emit TableSet(msg.sender, userTables[msg.sender], totalTables);
    }

    function warmCorner() external {
        unchecked {
            userCorners[msg.sender] += 1;
            totalCorners += 1;
        }

        emit CornerWarmed(msg.sender, userCorners[msg.sender], totalCorners);
    }
}
