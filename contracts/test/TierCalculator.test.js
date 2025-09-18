const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TierCalculator", function () {
    let tierCalculator;
    let multiStakeManager;
    let padToken;
    let owner;
    let user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy PADToken
        const PADToken = await ethers.getContractFactory("PADToken");
        padToken = await PADToken.deploy();

        // Deploy MultiStakeManager
        const MultiStakeManager = await ethers.getContractFactory("MultiStakeManager");
        multiStakeManager = await MultiStakeManager.deploy(await padToken.getAddress());

        // Deploy TierCalculator
        const TierCalculator = await ethers.getContractFactory("TierCalculator");
        tierCalculator = await TierCalculator.deploy();

        // Mint tokens for user
        await padToken.transfer(user1.address, ethers.parseEther("1000000"));
        await padToken.connect(user1).approve(await multiStakeManager.getAddress(), ethers.parseEther("1000000"));
    });

    describe("Fixed Tier Validation", function () {
        it("Should revert for invalid tier combination", async function () {
            const amount = ethers.parseEther("1000");
            const duration = 1 * 60 * 60; // 1 hour (wrong amount for 1 hour)

            await expect(multiStakeManager.connect(user1).createPosition(amount, duration))
                .to.be.revertedWith("Invalid tier amount");
        });

        it("Should set Bronze tier for 500 tokens, 1 hour", async function () {
            const amount = ethers.parseEther("500");
            const duration = 1 * 60 * 60; // 1 hour

            await multiStakeManager.connect(user1).createPosition(amount, duration);
            const position = await multiStakeManager.positions(1);
            expect(position.tier).to.equal(0); // Bronze tier
        });

        it("Should set Silver tier for 1000 tokens, 2 hours", async function () {
            const amount = ethers.parseEther("1000");
            const duration = 2 * 60 * 60; // 2 hours

            await multiStakeManager.connect(user1).createPosition(amount, duration);
            const position = await multiStakeManager.positions(1);
            expect(position.tier).to.equal(1); // Silver tier
        });

        it("Should set Gold tier for 3000 tokens, 3 hours", async function () {
            const amount = ethers.parseEther("3000");
            const duration = 3 * 60 * 60; // 3 hours

            await multiStakeManager.connect(user1).createPosition(amount, duration);
            const position = await multiStakeManager.positions(1);
            expect(position.tier).to.equal(2); // Gold tier
        });

        it("Should set Platinum tier for 4000 tokens, 4 hours", async function () {
            const amount = ethers.parseEther("4000");
            const duration = 4 * 60 * 60; // 4 hours

            await multiStakeManager.connect(user1).createPosition(amount, duration);
            const position = await multiStakeManager.positions(1);
            expect(position.tier).to.equal(3); // Platinum tier
        });

        it("Should revert for duration too short", async function () {
            const amount = ethers.parseEther("500");
            const duration = 30 * 60; // 30 minutes (less than 1 hour minimum)

            await expect(multiStakeManager.connect(user1).createPosition(amount, duration))
                .to.be.revertedWith("Duration too short");
        });
    });
}); 