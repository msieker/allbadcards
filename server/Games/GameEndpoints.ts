import {Express} from "express";
import {GameManager} from "./GameManager";

export const RegisterGameEndpoints = (app: Express) =>
{
	app.post("/create-game", async (req, res) => {
		const game = await GameManager.createGame(req.body.ownerGuid);

		res.send(game);
	});

	app.post("/join-game", async (req, res) => {
		const result = await GameManager.joinGame(req.body.playerGuid, req.body.gameId, req.body.nickname, JSON.parse(req.body.isSpectating ?? "false"));

		res.send(result);
	});

	app.post("/play-card", async (req, res) => {
		const result = await GameManager.playCard(req.body.gameId, req.body.playerGuid, req.body.cardId);

		res.send(result);
	});

	app.post("/select-winner-card", async(req, res) => {
		const result = await GameManager.selectWinnerCard(req.body.gameId, req.body.playerGuid, req.body.whiteCardId);

		res.send(result);
	});
};