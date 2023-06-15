// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract russianRoulette {
    address payable public owner;
    uint256 public ownerPool;
    uint8 constant BLOCKS_PER_ROUND = 3;
    uint256 public nextRoundBlock;
    mapping(uint => address payable) public players;
    uint8 public playerCount = 0;
    address payable public winnerAddress;
    bool public gameStarted = false;

    event PlayerJoined(address player);
    event RoundResult(address player, bool survived);
    event GameFinished(address winner);
    event GameStarted(bool);
    // New event

    constructor() {
        owner = payable(msg.sender);
    }

    function joinGame() external payable {
        require(gameStarted == false, "Game already started");
        require(msg.value == 0.1 ether, "Insufficient bet amount");
        require(players[playerCount] != msg.sender, "Address already joined the game");
        ownerPool += 0.01 ether;
        players[playerCount] = payable(msg.sender);
        playerCount++;
        emit PlayerJoined(msg.sender);
        
        if(playerCount == 8){
            startGame();
        }
    }

    function startGame() public {
        require(playerCount >= 2, "Not enough players");
        gameStarted = true;
        nextRoundBlock = block.number + BLOCKS_PER_ROUND;
        emit GameStarted(true);
    }

    function startNextRound() external {
    require(gameStarted, "Game hasn't started");
    require(block.number >= nextRoundBlock, "Can't start new round yet");

    uint8 loserIndex = uint8(uint256(blockhash(block.number - 1)) % playerCount);
    emit RoundResult(players[loserIndex], false);
    
    if(playerCount > 1) {
        players[loserIndex] = players[--playerCount];
        nextRoundBlock = block.number + BLOCKS_PER_ROUND;
    } else {
        gameFinished(players[0]);
    }
}

    function gameFinished(address _winner) private {
        gameStarted = false;
        winnerAddress = payable(_winner);
        emit GameFinished(_winner);
        
    }

    function withdraw() external {
        require(msg.sender == winnerAddress, "Only winner can withdraw");
        uint256 prize = address(this).balance - ownerPool;
        require(prize > 0, "No prize to withdraw");
        winnerAddress.transfer(prize);
    }

    function ownerWithdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(ownerPool > 0, "No owner pool to withdraw");
        owner.transfer(ownerPool);
        ownerPool = 0;
    }
}
