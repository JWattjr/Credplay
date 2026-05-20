// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract CredPlayPredictionMarket {
    struct Prediction {
        address creator;
        uint256 createdAt;
        uint256 yesSeeded;
        uint256 noSeeded;
        bool exists;
    }

    IERC20 public immutable feeToken;
    address public owner;
    address public treasury;
    uint256 public creationFee;

    mapping(bytes32 => Prediction) public predictions;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    event PredictionCreated(bytes32 indexed marketKey, address indexed creator, uint256 feeAmount, address feeToken);
    event PredictionSeeded(bytes32 indexed marketKey, address indexed seeder, uint256 amount, bool yesSide);
    event PredictionVoted(bytes32 indexed marketKey, address indexed voter, uint8 side);
    event TreasuryUpdated(address indexed treasury);
    event CreationFeeUpdated(uint256 creationFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(address feeToken_, address treasury_, uint256 creationFee_) {
        require(feeToken_ != address(0), "BAD_TOKEN");
        require(treasury_ != address(0), "BAD_TREASURY");
        feeToken = IERC20(feeToken_);
        owner = msg.sender;
        treasury = treasury_;
        creationFee = creationFee_;
    }

    function createPrediction(bytes32 marketKey) external {
        require(marketKey != bytes32(0), "BAD_MARKET_KEY");
        require(!predictions[marketKey].exists, "MARKET_EXISTS");

        if (creationFee > 0) {
            require(feeToken.transferFrom(msg.sender, treasury, creationFee), "FEE_TRANSFER_FAILED");
        }

        predictions[marketKey] = Prediction({
            creator: msg.sender,
            createdAt: block.timestamp,
            yesSeeded: 0,
            noSeeded: 0,
            exists: true
        });

        emit PredictionCreated(marketKey, msg.sender, creationFee, address(feeToken));
    }

    function seedPrediction(bytes32 marketKey, uint256 amount, bool yesSide) external {
        Prediction storage prediction = predictions[marketKey];
        require(prediction.exists, "MISSING_MARKET");
        require(amount > 0, "BAD_AMOUNT");
        require(feeToken.transferFrom(msg.sender, address(this), amount), "SEED_TRANSFER_FAILED");

        if (yesSide) {
            prediction.yesSeeded += amount;
        } else {
            prediction.noSeeded += amount;
        }

        emit PredictionSeeded(marketKey, msg.sender, amount, yesSide);
    }

    function votePrediction(bytes32 marketKey, uint8 side) external {
        require(predictions[marketKey].exists, "MISSING_MARKET");
        require(side == 1 || side == 2, "BAD_SIDE");
        require(!hasVoted[marketKey][msg.sender], "ALREADY_VOTED");

        hasVoted[marketKey][msg.sender] = true;
        emit PredictionVoted(marketKey, msg.sender, side);
    }

    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "BAD_TREASURY");
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setCreationFee(uint256 creationFee_) external onlyOwner {
        creationFee = creationFee_;
        emit CreationFeeUpdated(creationFee_);
    }

    function rescueToken(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "BAD_TO");
        require(IERC20(token).transfer(to, amount), "RESCUE_FAILED");
    }
}
