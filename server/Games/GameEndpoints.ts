import {Express} from "express";
import {GameManager} from "./GameManager";
import {CardManager} from "./CardManager";
import apicache from "apicache";

const cache = apicache.middleware;

export const RegisterGameEndpoints = (app: Express, clientFolder: string) =>
{
	app.get("/api/game/get", async (req, res, next) =>
	{
		console.log(req.url, req.query);

		try
		{
			const game = await GameManager.getGame(req.query.gameId);

			res.send(game);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.get("/api/game/get-white-card", cache("10 minutes"), async (req, res, next) =>
	{
		console.log(req.url, req.query);
		try
		{
			const card = CardManager.getWhiteCard(parseInt(req.query.cardId));

			res.send(card);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.get("/api/game/get-black-card", cache("10 minutes"), async (req, res, next) =>
	{
		console.log(req.url, req.query);
		try
		{
			const card = CardManager.getBlackCard(parseInt(req.query.cardId));

			res.send(card);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/create", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const game = await GameManager.createGame(req.body.ownerGuid, req.body.nickname);
			res.send(game);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/join", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.joinGame(req.body.playerGuid, req.body.gameId, req.body.nickname, JSON.parse(req.body.isSpectating ?? "false"));

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/kick", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.kickPlayer(req.body.gameId, req.body.targetGuid, req.body.playerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/start", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.startGame(req.body.gameId, req.body.ownerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/play-cards", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.playCard(req.body.gameId, req.body.playerGuid, req.body.cardIds);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/forfeit", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.forfeit(req.body.gameId, req.body.playerGuid, req.body.playedCards);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/reveal-next", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.revealNext(req.body.gameId, req.body.ownerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/start-round", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.startRound(req.body.gameId, req.body.ownerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/select-winner-card", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.selectWinnerCard(req.body.gameId, req.body.playerGuid, req.body.winningPlayerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.post("/api/game/next-round", async (req, res, next) =>
	{
		console.log(req.url, req.body);
		try
		{
			const result = await GameManager.nextRound(req.body.gameId, req.body.playerGuid);

			res.send(result);
		}
		catch (error)
		{
			res.send(500, { message: error.message, stack: error.stack });
		}
	});

	app.get("*", (req, res) =>
	{
		res.sendFile("index.html", {root: clientFolder});
	});
};