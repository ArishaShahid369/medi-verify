// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MediVerify
 * @dev Blockchain-powered pharmaceutical authentication
 * @author Arisha Shahid — MediVerify 2026
 */
contract MediVerify {

    struct Medicine {
        string name;
        string batchNumber;
        bytes32 sha256Hash;
        address manufacturer;
        uint256 registeredAt;
        bool isRecalled;
        uint256 verificationCount;
    }

    struct SupplyChainEvent {
        string stage;
        string handler;
        string location;
        uint256 timestamp;
        string notes;
    }

    address public owner;
    uint256 public totalMedicines;
    uint256 public totalVerifications;

    mapping(bytes32 => Medicine) public medicines;
    mapping(bytes32 => SupplyChainEvent[]) public supplyChains;
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => string) public manufacturerNames;

    event MedicineRegistered(string batchNumber, bytes32 hash, address manufacturer, uint256 timestamp);
    event MedicineVerified(bytes32 hash, bool isAuthentic, uint256 timestamp);
    event BatchRecalled(bytes32 hash, string batchNumber, uint256 timestamp);
    event ManufacturerAuthorized(address manufacturer, string name);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not authorized manufacturer");
        _;
    }

    modifier medicineExists(bytes32 hash) {
        require(medicines[hash].registeredAt > 0, "Medicine not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
        manufacturerNames[msg.sender] = "MediVerify Admin";
    }

    function authorizeManufacturer(address manufacturer, string memory name) external onlyOwner {
        authorizedManufacturers[manufacturer] = true;
        manufacturerNames[manufacturer] = name;
        emit ManufacturerAuthorized(manufacturer, name);
    }

    function registerMedicine(
        string memory name,
        string memory batchNumber,
        bytes32 hash,
        string memory location
    ) external onlyManufacturer {
        require(medicines[hash].registeredAt == 0, "Already registered");

        medicines[hash] = Medicine({
            name: name,
            batchNumber: batchNumber,
            sha256Hash: hash,
            manufacturer: msg.sender,
            registeredAt: block.timestamp,
            isRecalled: false,
            verificationCount: 0
        });

        supplyChains[hash].push(SupplyChainEvent({
            stage: "Manufacturing",
            handler: manufacturerNames[msg.sender],
            location: location,
            timestamp: block.timestamp,
            notes: "Genesis Block - Registered on MediVerify"
        }));

        totalMedicines++;
        emit MedicineRegistered(batchNumber, hash, msg.sender, block.timestamp);
    }

    function verifyMedicine(bytes32 hash)
        external
        medicineExists(hash)
        returns (bool isAuthentic, bool isRecalled, string memory batchNumber)
    {
        medicines[hash].verificationCount++;
        totalVerifications++;

        emit MedicineVerified(hash, !medicines[hash].isRecalled, block.timestamp);
        return (!medicines[hash].isRecalled, medicines[hash].isRecalled, medicines[hash].batchNumber);
    }

    function addSupplyChainEvent(
        bytes32 hash,
        string memory stage,
        string memory handler,
        string memory location,
        string memory notes
    ) external onlyManufacturer medicineExists(hash) {
        supplyChains[hash].push(SupplyChainEvent({
            stage: stage,
            handler: handler,
            location: location,
            timestamp: block.timestamp,
            notes: notes
        }));
    }

    function recallBatch(bytes32 hash) external onlyManufacturer medicineExists(hash) {
        require(!medicines[hash].isRecalled, "Already recalled");
        medicines[hash].isRecalled = true;
        emit BatchRecalled(hash, medicines[hash].batchNumber, block.timestamp);
    }

    function getMedicine(bytes32 hash) external view returns (Medicine memory) {
        return medicines[hash];
    }

    function getSupplyChain(bytes32 hash) external view returns (SupplyChainEvent[] memory) {
        return supplyChains[hash];
    }

    function getStats() external view returns (uint256, uint256) {
        return (totalMedicines, totalVerifications);
    }
}