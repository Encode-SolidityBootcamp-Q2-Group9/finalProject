import styles from "../styles/InstructionsComponent.module.css";
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import { useContractEvent } from 'wagmi'
import RussianRouletteJson from '../assets/russianRoulette.json';
import { useState, useEffect } from 'react';

export default function InstructionsComponent() {
    const { data: signer } = useSigner();
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signerAddress, setSignerAddress] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const setupContract = async () => {
            if (signer) {
                const signerAddress = await signer.getAddress();
                setSignerAddress(signerAddress);

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);

                const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ROULETTE_CONTRACT, RussianRouletteJson.abi, provider);
                const owner = await contract.owner();
                const isOwner = ethers.utils.getAddress(signerAddress) === ethers.utils.getAddress(owner);
                setIsOwner(isOwner);

                // Move setContract() here
                setContract(contract);
            }
        };
        setupContract();
    }, [signer]);

    return (
        <div className={styles.container}>
            <header className={styles.header_container}>
                <h1>Welcome to the Russian Roulette Dapp</h1>
                <p>Group 9</p>
            </header>
            <div className={styles.buttons_container}>
                <PageBody provider={provider} contract={contract} signerAddress={signerAddress} isOwner={isOwner} />
            </div>
            <div className={styles.footer}></div>
        </div>
    );
}

function PageBody({provider, contract, signerAddress, isOwner}) {
    const [gameEvents, setGameEvents] = useState([]);

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



function WalletInfo({ setIsOwner, isOwner, address }) {
    return (
        <div>
            <p>Wallet address: {address || 'Not connected'}</p>
            <p>{isOwner ? 'You are the owner of this contract' : 'You are a participant'}</p>
        </div>
    );
}

function OwnerPanel() {
    return (
        <div>
            <h2>Owner Controls</h2>
            <StartGame isOwner={true} />
            <StartNextRound isOwner={true} />
            <OwnerWithdraw isOwner={true} />
            <JoinGame />
        </div>
    );
}

function ParticipantPanel() {
    return (
        <div>
            <h2>Participant Controls</h2>
            <StartGame/>
            <JoinGame />
            <StartNextRound />
            <WinnerWithdraw />
        </div>
    );
}

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

function GameLog({ gameEvents }) {
    return (
        <div>
            <h2>Game Log</h2>
            {gameEvents.map((eventDetails, index) => <p key={index}>{eventDetails}</p>)}
        </div>
    );
}


