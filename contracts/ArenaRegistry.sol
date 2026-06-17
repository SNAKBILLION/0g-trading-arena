// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArenaRegistry {
    struct DecisionRecord {
        string decisionId;
        string strategyName;
        bytes32 contentHash;     // keccak256 of the full decision JSON
        string storageRootHash;  // 0G Storage root hash
        uint256 timestamp;
        address signer;
    }

    DecisionRecord[] public decisions;
    mapping(string => uint256) public decisionIndex; // decisionId => array index + 1

    event DecisionAnchored(
        string indexed decisionId,
        string strategyName,
        bytes32 contentHash,
        string storageRootHash,
        uint256 timestamp,
        address signer
    );

    function anchorDecision(
        string calldata decisionId,
        string calldata strategyName,
        bytes32 contentHash,
        string calldata storageRootHash
    ) external {
        require(decisionIndex[decisionId] == 0, "Already anchored");

        decisions.push(DecisionRecord({
            decisionId: decisionId,
            strategyName: strategyName,
            contentHash: contentHash,
            storageRootHash: storageRootHash,
            timestamp: block.timestamp,
            signer: msg.sender
        }));

        decisionIndex[decisionId] = decisions.length; // 1-indexed

        emit DecisionAnchored(
            decisionId,
            strategyName,
            contentHash,
            storageRootHash,
            block.timestamp,
            msg.sender
        );
    }

    function getDecision(string calldata decisionId)
        external view returns (DecisionRecord memory)
    {
        uint256 idx = decisionIndex[decisionId];
        require(idx > 0, "Not found");
        return decisions[idx - 1];
    }

    function totalDecisions() external view returns (uint256) {
        return decisions.length;
    }
}
