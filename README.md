# finalProject
# Russian Roulette Dapp
## Contract Address :  0x2bcd36e1ccb61097bb3f3197e37079a2d1e68a07#
The Russian Roulette Dapp is a decentralized application that allows users to participate in a thrilling game of Russian Roulette. Users can start a new game, join the game, and perform owner-specific actions. This Dapp also logs crucial game events.

## Join Game 

### Contract
```
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
    
```
    
    
 ### Instructions Component
    
```
    function JoinGame() {
    const { data: signer } = useSigner();

    const joinGame = async () => {
        if (signer) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const rouletteContract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider.getSigner());
            await rouletteContract.joinGame({ value: ethers.utils.parseEther("0.1") });
        }
    }

    return (
        <div>
            <button onClick={joinGame}>Join Game</button>
        </div>
    );
}
```
    
  ## Start Game 
    
   ### Contract 
    
    ```
     function startGame() public {
        require(playerCount >= 2, "Not enough players");
        gameStarted = true;
        nextRoundBlock = block.number + BLOCKS_PER_ROUND;
        emit GameStarted(true);
    }
    ```
    
   ### Instructions Component
    
    ```
    function StartGame() {
    const { data: signer } = useSigner();

    const startGame = async () => {
        if (signer && isOwner) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const rouletteContract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider.getSigner());
            await rouletteContract.startGame();
        }
    }

    return (
        <div>
            <button onClick={startGame}>Start Game</button>
        </div>
    );
}

## Start Next Round 

### Contract 

```
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
```

### Instructions Component

```

function StartNextRound() {
    const { data: signer } = useSigner();

    const startNextRound = async () => {
        if (signer) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const rouletteContract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider.getSigner());
            await rouletteContract.startNextRound();
        }
    }

    return (
        <div>
            <button onClick={startNextRound}>Start Next Round</button>
        </div>
    );
}
```


## Game Finished

### Contract
```
function gameFinished(address _winner) private {
        gameStarted = false;
        winnerAddress = payable(_winner);
        emit GameFinished(_winner);
        
    }

  ```
   
   
   
   ## Withdraw
   
   ### Contract
   
   ```
    function withdraw() external {
        require(msg.sender == winnerAddress, "Only winner can withdraw");
        uint256 prize = address(this).balance - ownerPool;
        require(prize > 0, "No prize to withdraw");
        winnerAddress.transfer(prize);
    }
    
  ```

   ### Instructions Component
    
```
    function WinnerWithdraw() {
    const { data: signer } = useSigner();

    const withdraw = async () => {
        if (signer) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const rouletteContract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider.getSigner());
            await rouletteContract.withdraw();
        }
    }

    return (
        <div>
            <button onClick={withdraw}>Withdraw Prize</button>
        </div>
    );
}
 
 ```



## Owner Withdraw
   
   
 ### Contract
   
  ```
   function ownerWithdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(ownerPool > 0, "No owner pool to withdraw");
        owner.transfer(ownerPool);
        ownerPool = 0;
    }
}
   ```
   ### Instructions Component
   
   ```
   function OwnerWithdraw({ isOwner }) {
    const { data: signer } = useSigner();

    const withdraw = async () => {
        if (signer && isOwner) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const rouletteContract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider.getSigner());
            await rouletteContract.ownerWithdraw();
        }
    }

    return (
        <div>
            <button onClick={withdraw} disabled={!isOwner}>Withdraw Owner Fee</button>
        </div>
    );
}

   ```
   ## Game Log 
   
   ### Instructions Component 
   
   ```
   function GameLog({ gameEvents }) {
    return (
        <div>
            <h2>Game Log</h2>
            {gameEvents.map((eventDetails, index) => <p key={index}>{eventDetails}</p>)}
        </div>
    );
}

useEffect(() => {
        const fetchPastEvents = async () => {
            if (contract) {
                const events = await contract.queryFilter('*');
                // Now `events` is an array of Event objects representing past events.
                // You can format them and store them in your component's state.
                   const lastEvents =  events.slice(Math.max(events.length - 6, 0));

                const formattedEvents = lastEvents.map(event => {
                    // Format event...
                    let args = event.args;
                    let eventName = event.event;
                    let eventDetails = "";

                    switch (eventName) {
                        case "PlayerJoined":
                            eventDetails = `Player ${args.player} joined`;
                            break;
                        case "GameStarted":
                            eventDetails = `Game started`;
                            break;
                        case "RoundResult":
                            eventDetails = `${args.player} is no longer with us`;
                            break;
                        case "GameFinished":
                            eventDetails = `Game finished, survivor: ${args.winner}`;
                            break;
                        default:
                            eventDetails = "Unknown event";
                    }

                    return eventDetails;
                });
                setGameEvents(formattedEvents);
            }
        };

        fetchPastEvents();
    }, [contract]);

    return (
        <>
            <WalletInfo isOwner={isOwner} address={signerAddress} />
            { isOwner ? <OwnerPanel provider={provider} contract={contract} /> : <ParticipantPanel provider={provider} contract={contract} /> }
            <GameLog gameEvents={gameEvents} />
        </>
    );
}

   ```
    
    
    
