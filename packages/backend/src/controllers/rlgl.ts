import { ClientToServerEvents, ServerAug, ServerSocketAug, wsCodes } from "types";
import PlayersModel from "../models/playerModel";
import typia from "typia";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let rlglGameInstance: RlglGame | null = null;

const ALLOWED_SURVIVORS = [5, 38, 40, 42, 44, 46, 76, 80, 80, 84, 88, 92, 114, 120, 126, 132, 138];
const MIN_GREEN_LIGHT_MS = 500;
const MAX_GREEN_LIGHT_MS = 6000;
const MAX_RED_LIGHT_MS = 8000; // Maximum time to wait if target eliminations aren't met
const MEDIAN_DISTANCE_UPDATE_TIMEOUT_MS = 8000; // Max time to wait for median distance update

class RlglGame {

    private io: ServerAug;

    private initialPlayers: number;
    private activePlayers: number;
    private finishedPlayers: number = 0;

    private targetSurvivors: number;
    private eliminationsThisRound: number = 0;
    private targetEliminationsForCurrentRound: number = 0; // Target for the *current* RL phase    
    
    private totalDistance: number;
    private medianDistance: number = 0;
    
    private isGreenLight: boolean = false;
    private stopRequested: boolean = false;
    private redLightPromiseResolver: (() => void) | null = null; // To resolve the RL delay early
    private greenLightOverrideMs: number | null = null; // Store the override value

    // Pause State
    private paused: boolean = false;
    private pausePromise: Promise<void> | null = null;
    private pausePromiseResolver: (() => void) | null = null;

    // Median Distance Update Tracking
    private medianDistanceUpdatedSinceLastCheck: boolean = false;


    public constructor(io: ServerAug, initialPlayers: number, totalDistance: number) {
        this.io = io;
        this.initialPlayers = initialPlayers;
        this.activePlayers = initialPlayers;
        this.totalDistance = totalDistance;

        const idealTarget = initialPlayers * 0.7;
        this.targetSurvivors = ALLOWED_SURVIVORS.reduce((prev, curr) =>
            Math.abs(curr - idealTarget) < Math.abs(prev - idealTarget) ? curr : prev
        );
        console.log(`RLGL Game Instance: Initialized with ${initialPlayers} players. Target survivors: ${this.targetSurvivors}.`);
    }

    public start = (): void => {
        this.stopRequested = false;
        this.io.to('rlgl-participants').emit("games.rlgl.start");
        this.gameLoop();
    }

    public stopGame = (): void => {
        console.log("RLGL Instance: Stopping game.");
        this.stopRequested = true;
        // If paused, resolve the promise to allow the loop to exit
        if (this.paused && this.pausePromiseResolver) {
            this.pausePromiseResolver();
        }
        this.io.to('rlgl-participants').emit("games.rlgl.stop");
    }

    public handleEvent = (event: keyof ClientToServerEvents, data: any, ack: any) => {
        if (event == 'games.rlgl.playerFinished'){
            type playerFinishedParams = Parameters<ClientToServerEvents['games.rlgl.playerFinished']>;
            if (typia.is<playerFinishedParams['0']>(data)){
                this.finishedPlayers++;
                this.activePlayers--;
                ack({ code: wsCodes.SUCCESS });
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE });
                return;
            }
        } else if (event == 'games.rlgl.setAverageDistance') {
            type setAverageDistanceParams = Parameters<ClientToServerEvents['games.rlgl.setAverageDistance']>;
            if (typia.is<setAverageDistanceParams['0']>(data)){
                this.medianDistance = data;
                this.medianDistanceUpdatedSinceLastCheck = true; // Set the flag
                ack({ code: wsCodes.SUCCESS }); // Acknowledge successful update
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE });
                return;
            }
        } else if (event == "players.eliminate"){
            // Check has already been handled in higher level
            this.activePlayers--;
            if (!this.isGreenLight) {
                this.eliminationsThisRound++;
                // Check if the target for the current red light phase is met
                // No need to check for pause here, redLightPromiseResolver handles the wait interruption
                if (this.eliminationsThisRound >= this.targetEliminationsForCurrentRound && this.redLightPromiseResolver) {
                    console.log(`RLGL: Target eliminations (${this.targetEliminationsForCurrentRound}) met for this round.`);
                    this.redLightPromiseResolver(); // Resolve the delay early
                    this.redLightPromiseResolver = null; // Prevent multiple resolves
                }
            }
            ack({ code: wsCodes.SUCCESS });
        } else if (event == "games.rlgl.timerOverride"){
            type timerOverrideParams = Parameters<ClientToServerEvents['games.rlgl.timerOverride']>;
            if (typia.is<timerOverrideParams['0']>(data) && data > 0) {
                this.greenLightOverrideMs = data;
                console.log(`RLGL: Green light duration override set to ${data}ms for the next cycle.`);
                ack({ code: wsCodes.SUCCESS });
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE, message: "Invalid duration provided." });
            }
        } else if (event == "games.rlgl.pause"){
            if (this.paused || this.stopRequested) {
                ack({ code: wsCodes.NO_ACTION, message: "Game is already paused or stopped." });
                return;
            }
            this.paused = true;
            this.pausePromise = new Promise(resolve => {
                this.pausePromiseResolver = resolve;
            });
            console.log("RLGL: Game paused.");
            // No client emit needed per user request
            ack({ code: wsCodes.SUCCESS });

        } else if (event == "games.rlgl.resume"){
            if (!this.paused || this.stopRequested) {
                ack({ code: wsCodes.NO_ACTION, message: "Game is not paused or is stopped." });
                return;
            }
            this.paused = false;
            if (this.pausePromiseResolver) {
                this.pausePromiseResolver(); // Resolve the promise to unblock the game loop
            }
            this.pausePromise = null;
            this.pausePromiseResolver = null;
            console.log("RLGL: Game resumed.");
            // No client emit needed per user request
            ack({ code: wsCodes.SUCCESS });
        }
    };

    private calculateControlParameters = () => {
        const currentTotalPlayers = this.activePlayers + this.finishedPlayers;
        const eliminationsStillNeeded = Math.max(0, currentTotalPlayers - this.targetSurvivors);

        let targetEliminationsForNextRound = 0;
        let greenLightDuration = MAX_GREEN_LIGHT_MS;

        if (eliminationsStillNeeded > 0 && this.activePlayers > 0) {
            const progressFactor = Math.max(0, 1 - (this.medianDistance / this.totalDistance));
            const remainingCyclesEstimate = Math.max(1, Math.round(5 * progressFactor)); // Rough estimate

            targetEliminationsForNextRound = Math.max(1, Math.ceil(eliminationsStillNeeded / remainingCyclesEstimate));
            // Safety cap: Don't target more than 30% of active players in one go
            targetEliminationsForNextRound = Math.min(targetEliminationsForNextRound, Math.ceil(this.activePlayers * 0.3));

            const urgencyFactor = eliminationsStillNeeded / this.activePlayers; // How many needed relative to pool
            // Higher urgency -> shorter green light
            greenLightDuration = MIN_GREEN_LIGHT_MS + (MAX_GREEN_LIGHT_MS - MIN_GREEN_LIGHT_MS) * (1 - Math.min(1, urgencyFactor * 1.5)); // Scale urgency effect

            // Adjust slightly for distance: players further back get a bit more time
            const distanceAdjustmentFactor = 1 + (0.2 * (1 - Math.min(1, this.medianDistance / this.totalDistance))); // Max 20% longer if at start
            greenLightDuration *= distanceAdjustmentFactor;

            greenLightDuration = Math.max(MIN_GREEN_LIGHT_MS, Math.min(MAX_GREEN_LIGHT_MS, greenLightDuration));

        } else {
            // If no elims needed, make green light long to let players finish
            greenLightDuration = MAX_GREEN_LIGHT_MS;
            targetEliminationsForNextRound = 0;
        }

        return {
            targetEliminations: Math.round(targetEliminationsForNextRound),
            greenLightDurationMs: Math.round(greenLightDuration)
        };
    }

    private checkPause = async (context: string): Promise<boolean> => {
        if (this.paused) {
            console.log(`RLGL: Loop waiting while paused (${context})...`);
            await this.pausePromise;
            console.log(`RLGL: Loop resumed (${context}).`);
            if (this.stopRequested) return true; // Indicate loop should break
        }
        return false; // Indicate loop should continue
    }

    private gameLoop = async () => {
        try {
            while (!this.stopRequested && this.activePlayers > 0) {
                // --- Check if paused at the start of the loop ---
                if (await this.checkPause("start of loop")) break;

                // --- Decision Phase (End of previous Red Light / Before Green Light) ---
                let { targetEliminations, greenLightDurationMs } = this.calculateControlParameters();
                this.targetEliminationsForCurrentRound = targetEliminations; // Set target for the upcoming RL phase

                // --- Apply Override if present ---
                if (this.greenLightOverrideMs !== null) {
                    console.log(`RLGL: Applying manual override for green light duration: ${this.greenLightOverrideMs}ms`);
                    greenLightDurationMs = this.greenLightOverrideMs;
                    this.greenLightOverrideMs = null; // Reset override after applying it once
                }

                // --- Green Light Phase ---
                this.isGreenLight = true;
                this.eliminationsThisRound = 0; // Reset for the *next* red light
                console.log(`RLGL: Green Light! Duration: ${greenLightDurationMs}ms. Active: ${this.activePlayers}, Finished: ${this.finishedPlayers}. Next RL Target: ${this.targetEliminationsForCurrentRound}`);
                this.io.to('rlgl-participants').emit("games.rlgl.gl", greenLightDurationMs);
                await delay(greenLightDurationMs);
                if (this.stopRequested) break;

                // --- Check pause after Green Light delay ---
                if (await this.checkPause("after Green Light")) break;

                // --- Red Light Phase ---
                this.isGreenLight = false;
                this.medianDistanceUpdatedSinceLastCheck = false; // Reset flag before RL starts
                console.log(`RLGL: Red Light! Target eliminations: ${this.targetEliminationsForCurrentRound}.`);
                this.io.to('rlgl-participants').emit("games.rlgl.rl", this.targetEliminationsForCurrentRound);

                // Wait for target eliminations or max duration
                let redLightTimeout: NodeJS.Timeout | null = null;
                const redLightPromise = new Promise<void>(resolve => {
                    this.redLightPromiseResolver = resolve;
                    redLightTimeout = setTimeout(() => {
                        console.log("RLGL: Red light max duration reached.");
                        resolve(); // Resolve if max time is hit
                    }, MAX_RED_LIGHT_MS);
                });

                await redLightPromise;
                if (redLightTimeout) clearTimeout(redLightTimeout); // Clear timeout if resolved early
                this.redLightPromiseResolver = null; // Clean up resolver

                // --- Check pause after Red Light resolution/timeout ---
                if (await this.checkPause("after Red Light")) break;

                // --- Wait for Median Distance Update ---
                console.log("RLGL: Waiting for median distance update...");
                const waitStartTime = Date.now();
                while (!this.medianDistanceUpdatedSinceLastCheck && !this.stopRequested) {
                    // --- Check pause inside median distance wait loop ---
                    if (this.paused) {
                        console.log("RLGL: Paused while waiting for median distance update.");
                        await this.pausePromise;
                        console.log("RLGL: Resumed while waiting for median distance update.");
                        if (this.stopRequested) break; // Break inner while loop
                    }
                    if (this.stopRequested) break; // Break inner while loop if stopped during pause

                    if (Date.now() - waitStartTime > MEDIAN_DISTANCE_UPDATE_TIMEOUT_MS) {
                        console.warn("RLGL: Timeout waiting for median distance update. Proceeding with potentially stale data.");
                        break; // Exit inner while loop after timeout
                    }

                    await delay(50); // Check every 50ms
                }
                if (this.stopRequested) break; // Break outer while loop if stopped
                if (this.medianDistanceUpdatedSinceLastCheck) {
                    console.log("RLGL: Median distance updated.");
                }

                // --- Check pause after median distance wait ---
                if (await this.checkPause("after median distance wait")) break;

                // Ensure median distance is updated before next decision phase
                // (Assuming setAverageDistance is called frequently by staff/system during RL)
                await delay(100); // Small delay to allow potential final updates

                if (this.stopRequested) break;

                // --- Check pause after small delay ---
                if (await this.checkPause("after final delay")) break;
            }
        } catch (error) {
            console.error("Error in RLGL game loop:", error);
        } finally {
            this.stopGame();
        }
    };
}

const rlglEventHandler = async (
    event: keyof ClientToServerEvents,
    data: any,
    io: ServerAug,
    ack: any
): Promise<void> => {

    try {
        if (event === 'games.rlgl.start') {
            if (rlglGameInstance) {
                ack({ code: wsCodes.NO_ACTION });
                return;
            }
            const initialPlayers = await PlayersModel.countDocuments({ $and: [{ here: true }, { alive: true }] });
            if (initialPlayers <= 0) {
                ack({ code: wsCodes.NO_ACTION });
                return;
            }
            rlglGameInstance = new RlglGame(io, initialPlayers, 52);
            rlglGameInstance.start();
            ack({ code: wsCodes.SUCCESS });

        } else if (event === 'games.rlgl.stop') {
            if (!rlglGameInstance) {
                ack({ code: wsCodes.NO_ACTION, message: "No game running to stop." });
                return;
            }
            rlglGameInstance.stopGame();
            rlglGameInstance = null;
            ack({ code: wsCodes.SUCCESS });
            console.log("RLGL Handler: Game stopped.");

        } else { // Event is internal to the game
            if (!rlglGameInstance) {
                ack({ code: wsCodes.NO_ACTION, message: "No game running." });
                return;
            }
            rlglGameInstance.handleEvent(event, data, ack);
        }
    } catch (error) {
        ack({ code: wsCodes.SERVER_ERROR });
    }
};

export default rlglEventHandler;