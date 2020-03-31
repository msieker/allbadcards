import {Express} from "express";
import {GameManager} from "./GameManager";
import {CardManager} from "./CardManager";

export const RegisterGameEndpoints = (app: Express, clientFolder: string) =>
{
	app.get("/api/game/get", async (req, res) => {
		console.log(req.url, req.query);
		const game = await GameManager.getGame(req.query.gameId);

		res.send(game);
	});

	app.get("/api/game/get-white-card", async (req, res) => {
		console.log(req.url, req.query);
		const card = CardManager.getWhiteCard(req.query.cardId);

		res.send(card);
	});

	app.get("/api/game/get-black-card", async (req, res) => {
		console.log(req.url, req.query);
		const card = CardManager.getBlackCard(req.query.cardId);

		res.send(card);
	});

	app.get("/api/game/get", async (req, res) => {
		console.log(req.url, req.query);
		const game = await GameManager.getGame(req.query.gameId);

		res.send(game);
	});

	app.post("/api/game/create", async (req, res) => {
		console.log(req.url, req.body);
		const game = await GameManager.createGame(req.body.ownerGuid, req.body.nickname);

		res.send(game);
	});

	app.post("/api/game/join", async (req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.joinGame(req.body.playerGuid, req.body.gameId, req.body.nickname, JSON.parse(req.body.isSpectating ?? "false"));

		res.send(result);
	});

	app.post("/api/game/start", async (req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.startGame(req.body.gameId, req.body.ownerGuid);

		res.send(result);
	});

	app.post("/api/game/play-card", async (req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.playCard(req.body.gameId, req.body.playerGuid, req.body.cardId);

		res.send(result);
	});

	app.post("/api/game/reveal-next", async (req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.revealNext(req.body.gameId, req.body.ownerGuid);

		res.send(result);
	});

	app.post("/api/game/select-winner-card", async(req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.selectWinnerCard(req.body.gameId, req.body.playerGuid, req.body.whiteCardId);

		res.send(result);
	});

	app.post("/api/game/next-round", async (req, res) => {
		console.log(req.url, req.body);
		const result = await GameManager.nextRound(req.body.gameId, req.body.playerGuid);

		res.send(result);
	});

	app.get("*", (req, res) =>
	{
		res.sendFile("index.html", {root: clientFolder});
	});
};