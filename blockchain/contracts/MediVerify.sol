// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MediVerify {

    struct Medicine {
        string name;
        string batchNumber;
        bytes32 sha256Hash;
        address manufacturer;
        uint256 registeredAt;
        uint256 expiryTimestamp;  // ← NEW: blockchain-enforced expiry
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

    // Verification result enum
    enum VerificationStatus {
        AUTHENTIC,
        EXPIRED_REVOKED,    // ← NEW: self-destruct state
        RECALLED,
        NOT_FOUND
    }

    address public owner;
    uint256 public totalMedicines;
    uint256 public totalVerifications;
    uint256 public totalRevokedAttempts;  // ← NEW: track clone attempts

    mapping(bytes32 => Medicine) public medicines;
    mapping(bytes32 => SupplyChainEvent[]) public supplyChains;
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => string) public manufacturerNames;

    event MedicineRegistered(string batchNumber, bytes32 hash, address manufacturer, uint256 expiryTimestamp);
    event MedicineVerified(bytes32 hash, VerificationStatus status, uint256 timestamp);
    event BatchRecalled(bytes32 hash, string batchNumber, uint256 timestamp);
    event CryptoTokenRevoked(bytes32 indexed hash, string batchNumber, uint256 attemptedAt);
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
        string memory location,
        uint256 expiryTimestamp
    ) external onlyManufacturer {
        require(medicines[hash].registeredAt == 0, "Already registered");
        require(expiryTimestamp > block.timestamp, "Expiry must be in the future");

        medicines[hash] = Medicine({
            name: name,
            batchNumber: batchNumber,
            sha256Hash: hash,
            manufacturer: msg.sender,
            registeredAt: block.timestamp,
            expiryTimestamp: expiryTimestamp,
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
        emit MedicineRegistered(batchNumber, hash, msg.sender, expiryTimestamp);
    }

    // ══ SELF-DESTRUCTING QR VERIFICATION ══
    function verifyMedicine(bytes32 hash)
        external
        medicineExists(hash)
        returns (VerificationStatus status, string memory batchNumber, uint256 expiryTimestamp)
    {
        Medicine storage med = medicines[hash];

        // ── CRITICAL CHECK: Has the cryptographic token expired? ──
        if (block.timestamp > med.expiryTimestamp) {
            totalRevokedAttempts++;

            // Log the revocation attempt on-chain
            supplyChains[hash].push(SupplyChainEvent({
                stage: "CRYPTO TOKEN REVOKED",
                handler: "MediVerify Security System",
                location: "Blockchain Enforced",
                timestamp: block.timestamp,
                notes: "Self-destruct triggered - expired batch scan attempt detected"
            }));

            emit CryptoTokenRevoked(hash, med.batchNumber, block.timestamp);
            return (VerificationStatus.EXPIRED_REVOKED, med.batchNumber, med.expiryTimestamp);
        }

        // Check recall status
        if (med.isRecalled) {
            return (VerificationStatus.RECALLED, med.batchNumber, med.expiryTimestamp);
        }

        // Authentic!
        med.verificationCount++;
        totalVerifications++;

        emit MedicineVerified(hash, VerificationStatus.AUTHENTIC, block.timestamp);
        return (VerificationStatus.AUTHENTIC, med.batchNumber, med.expiryTimestamp);
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

    function getStats() external view returns (uint256, uint256, uint256) {
        return (totalMedicines, totalVerifications, totalRevokedAttempts);
    }

    // ── Check if token is still valid (read-only) ──
    function isTokenValid(bytes32 hash) external view returns (bool) {
        if (medicines[hash].registeredAt == 0) return false;
        if (medicines[hash].isRecalled) return false;
        return block.timestamp <= medicines[hash].expiryTimestamp;
    }
}