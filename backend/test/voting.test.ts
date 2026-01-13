import { expect } from "chai"
import { ethers, network } from "hardhat"
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { developmentChains } from "../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Voting Contract", function () {
          async function deployVotingFixture() {
              const [owner, voter1, voter2, voter3] = await ethers.getSigners()
              const candidateNames = ["Nathan", "Jane", "John"]
              const durationInMinutes = 60

              const votingFactory = await ethers.getContractFactory("Voting")
              const voting = await votingFactory.deploy(candidateNames, durationInMinutes)

              return { voting, candidateNames, owner, voter1, voter2, voter3, durationInMinutes }
          }

          describe("Constructor", function () {
              it("have the correct number of candidates", async function () {
                  const { voting } = await loadFixture(deployVotingFixture)
                  const candidates = await voting.getAllCandidates()
                  expect(candidates.length).to.equal(3)
              })

              it("candidate names must be in sequence", async function () {
                  const { voting } = await loadFixture(deployVotingFixture)
                  const candidates = await voting.getAllCandidates()
                  expect(candidates[0].name).to.equal("Nathan")
                  expect(candidates[1].name).to.equal("Jane")
                  expect(candidates[2].name).to.equal("John")
              })
          })

          describe("Deployment & Owner", function () {
              it("set the correct owner", async function () {
                  const { voting, owner } = await loadFixture(deployVotingFixture)
                  expect(await voting.i_owner()).to.equal(owner.address)
              })
          })

          describe("Add Candidate", function () {
              it("Owner can add candidate", async function () {
                  const { voting, candidateNames } = await loadFixture(deployVotingFixture)
                  await expect(voting.addCandidate("Nathan"))
                      .to.emit(voting, "CandidateAdded")
                      .withArgs("Nathan")

                  const candidatesAfterAdded = await voting.getAllCandidates()
                  expect(candidatesAfterAdded.length).to.equal(candidateNames.length + 1)
              })

              it("Other people (non-owner) can't add candidate", async function () {
                  const { voting, voter1 } = await loadFixture(deployVotingFixture)
                  const nonOwner = voting.connect(voter1)
                  await expect(nonOwner.addCandidate("Nathan")).to.be.revertedWithCustomError(
                      voting,
                      "Voting__NotOwner",
                  )
              })
          })

          describe("Voting logic", function () {
              it("people can vote and voteCount increment", async function () {
                  const { voting, voter1 } = await loadFixture(deployVotingFixture)
                  await expect(voting.connect(voter1).vote(0))
                      .to.emit(voting, "Voted")
                      .withArgs(voter1.address, 0)

                  const candidates = await voting.getAllCandidates()
                  expect(candidates[0].voteCount).to.equal(1)
              })

              it("don't allow to vote 2 times (Double Voting)", async function () {
                  const { voting, voter1 } = await loadFixture(deployVotingFixture)
                  await voting.connect(voter1).vote(0)

                  await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(
                      voting,
                      "Voting__AlreadyVoted",
                  )
              })

              it("don't allow to vote for non-existent candidates", async function () {
                  const { voting, voter1 } = await loadFixture(deployVotingFixture)
                  await expect(voting.connect(voter1).vote(99)).to.be.revertedWithCustomError(
                      voting,
                      "Voting__InvalidCandidate",
                  )
              })
          })

          describe("Time-Based Logic", function () {
              it("Can vote as long as the time hasn't run out", async function () {
                  const { voting, voter1 } = await loadFixture(deployVotingFixture)
                  await expect(voting.connect(voter1).vote(0))
                      .to.emit(voting, "Voted")
                      .withArgs(voter1.address, 0)
              })

              it("Can't vote if time is over", async function () {
                  const { voting, voter1, durationInMinutes } =
                      await loadFixture(deployVotingFixture)
                  await time.increase(durationInMinutes * 60)
                  await expect(voting.connect(voter1).vote(0)).to.be.revertedWithCustomError(
                      voting,
                      "Voting__ElectionEnded",
                  )
              })
          })

          describe("Winning Logic", function () {
              it("Can handle single winner correctly", async function () {
                  const { voting, voter1, voter2, voter3, durationInMinutes } =
                      await loadFixture(deployVotingFixture)
                  await voting.connect(voter1).vote(0)
                  await voting.connect(voter2).vote(0)
                  await voting.connect(voter3).vote(1)

                  await time.increase(durationInMinutes * 60)

                  const winner = await voting.getWinner()
                  expect(winner.length).to.equal(1)
                  expect(winner[0].name).to.equal("Nathan")
                  expect(winner[0].voteCount).to.equal(2)
              })

              it("Can handle draw result correctly", async function () {
                  const { voting, voter1, voter2, voter3, durationInMinutes } =
                      await loadFixture(deployVotingFixture)
                  await voting.connect(voter1).vote(0)
                  await voting.connect(voter2).vote(1)
                  await voting.connect(voter3).vote(2)

                  await time.increase(durationInMinutes * 60 + 1)

                  const winner = await voting.getWinner()
                  expect(winner.length).to.equal(3)
                  expect(winner[0].name).to.equal("Nathan")
                  expect(winner[1].name).to.equal("Jane")
                  expect(winner[2].name).to.equal("John")
              })

              it("Can't see the winner if election still ongoing", async function () {
                  const { voting } = await loadFixture(deployVotingFixture)
                  await expect(voting.getWinner()).to.be.revertedWithCustomError(
                      voting,
                      "Voting__ElectionStillOngoing",
                  )
              })

              it("Revert if nobody votes (0 votes each)", async function () {
                  const { voting, durationInMinutes } = await loadFixture(deployVotingFixture)
                  await time.increase(durationInMinutes * 60)
                  await expect(voting.getWinner()).to.be.revertedWithCustomError(
                      voting,
                      "Voting__NoVoteCast",
                  )
              })
          })

          describe("Get remaining time", function () {
              it("Should return correct remaining time", async function () {
                  const { voting, durationInMinutes } = await loadFixture(deployVotingFixture)
                  const remainingTimeInitial = await voting.getRemainingTime()
                  expect(remainingTimeInitial).to.be.closeTo(durationInMinutes * 60, 5)

                  await time.increase(30 * 60)

                  const remainingTimeLater = await voting.getRemainingTime()
                  expect(remainingTimeLater).to.be.closeTo(30 * 60, 5)
              })

              it("Should return 0 if election is over", async function () {
                  const { voting, durationInMinutes } = await loadFixture(deployVotingFixture)
                  await time.increase(durationInMinutes * 60)
                  let remainingTime = await voting.getRemainingTime()
                  expect(remainingTime).to.equal(0)

                  await time.increase(1)
                  remainingTime = await voting.getRemainingTime()
                  expect(remainingTime).to.equal(0)
              })
          })
      })
