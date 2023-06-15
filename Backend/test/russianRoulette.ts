import { RussianRoulette, RussianRoulette__factory } from "../typechain-types";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

describe("RussianRoulette contract", function () {
    let russianRoulette: RussianRoulette;
    let player1: SignerWithAddress;
    let player2: SignerWithAddress;
    let player3: SignerWithAddress;
    let player4: SignerWithAddress;
    let deployer: SignerWithAddress;

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        [deployer, player1, player2, player3, player4] = accounts;

        const russianRouletteFactory = new RussianRoulette__factory(deployer);
        russianRoulette = await russianRouletteFactory.deploy();
        await russianRoulette.deployed();
    });

    describe("when the contract is deployed", function () {
        it("should set the game status to not started", async function () {
            expect(await russianRoulette.gameStarted()).to.be.false;
        });
    });

    describe("Game functionality", function () {
        it("should allow players to join the game", async function () {
            await russianRoulette.connect(player1).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player2).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player3).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player4).joinGame({ value: ethers.utils.parseEther("0.05") });
            expect(await russianRoulette.playerCount()).to.equal(4);
        });

        it("should automatically start the game after 4 players have joined", async function () {
            await russianRoulette.connect(player1).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player2).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player3).joinGame({ value: ethers.utils.parseEther("0.05") });
            await russianRoulette.connect(player4).joinGame({ value: ethers.utils.parseEther("0.05") });
            expect(await russianRoulette.gameStarted()).to.be.true;
        });

        // Further tests related to game rounds and winner selection would be quite complex as they would need to
        // involve waiting for several blocks to be mined to allow for round progression and would also be heavily
        // dependent on block hashes, which are not easily predictable or controllable in a test environment.
    });
});
