import {Database} from "../DB/Database";
import shortid from "shortid";
import {CardManager} from "./CardManager";
import WebSocket from "ws";
import * as https from "https";

interface IWSMessage
{
	playerGuid: string;
}

export interface GamePlayer
{
	guid: string;
	nickname: string;
	wins: number;
	whiteCards: number[];
	isSpectating: boolean;
}

export interface GameItem
{
	id: string;
	ownerGuid: string;
	chooserGuid: string | null;
	dateCreated: Date;
	public: boolean;
	players: { [key: string]: GamePlayer };
	blackCard: number;
	// key = player guid, value = white card ID
	roundCards: { [key: string]: number };
	usedBlackCards: number[];
	usedWhiteCards: number[];
}

class _GameManager
{
	public static Instance = new _GameManager();

	private wss: WebSocket.Server;

	// key = playerGuid, value = WS key
	private wsClientPlayerMap: { [key: string]: string };

	constructor()
	{
		console.log("Starting WebSocket Server");

		Database.initialize();

		this.wss = new WebSocket.Server({
			port: 8080
		});

		this.wss.on("connection", (ws, req) =>
		{
			const id = req.headers['sec-websocket-key'] as string | undefined;
			if (id)
			{
				(ws as any)["id"] = id;
				ws.on("message", (message) =>
				{
					const data = JSON.parse(message as string) as IWSMessage;
					if (!(data.playerGuid in this.wsClientPlayerMap))
					{
						this.wsClientPlayerMap[data.playerGuid] = id;
					}
				});
			}
		});
	}

	private get games()
	{
		return Database.db.collection<GameItem>("games");
	}

	private async getGame(gameId: string)
	{
		let existingGame: GameItem | null;
		try
		{
			existingGame = await this.games.findOne({
				id: gameId
			});
		}
		catch (e)
		{
			throw new Error("Could not find game.");
		}

		if (!existingGame)
		{
			throw new Error("Game not found!");
		}

		return existingGame;
	}

	public async updateGame(newGame: GameItem)
	{
		await Database.db.collection<GameItem>("games").updateOne({
			id: newGame.id
		}, newGame);

		const playerGuids = Object.keys(newGame.players);
		const wsIds = playerGuids.map(pg => this.wsClientPlayerMap[pg]);
		this.wss.clients.forEach(ws =>
		{
			if (wsIds.includes((ws as any).id))
			{
				ws.send(newGame);
			}
		});

		return newGame;
	}

	public async createGame(ownerGuid: string): Promise<GameItem>
	{
		console.log(`Creating game for ${ownerGuid}`);

		const gameId = shortid.generate();

		try
		{
			await this.games.insertOne({
				id: gameId,
				ownerGuid,
				chooserGuid: null,
				dateCreated: new Date(),
				players: {},
				public: false,
				blackCard: -1,
				roundCards: {},
				usedBlackCards: [],
				usedWhiteCards: []
			});

			const game = await this.getGame(gameId);

			console.log(`Created game for ${ownerGuid}: ${game.id}`);

			return game;
		}
		catch (e)
		{
			console.error(e);

			throw new Error("Could not create game.");
		}
	}

	public async joinGame(playerGuid: string, gameId: string, nickname: string, isSpectating: boolean)
	{
		const existingGame = await this.getGame(gameId);

		if (Object.keys(existingGame.players).length >= 8)
		{
			throw new Error("This game is full.");
		}

		const newGame = {...existingGame};
		newGame.players[playerGuid] = {
			guid: playerGuid,
			whiteCards: [],
			nickname,
			wins: 0,
			isSpectating
		};

		await this.updateGame(newGame);

		return newGame;
	}

	public async startGame(gameId: string)
	{
		const existingGame = await this.getGame(gameId);

		const newHands = await CardManager.dealWhiteCards(existingGame);
		const newGame = {...existingGame};

		const playerGuids = Object.keys(existingGame.players);
		newGame.chooserGuid = playerGuids[playerGuids.length - 1];

		Object.keys(newGame.players).forEach(playerGuid =>
		{
			newGame.players[playerGuid].whiteCards = newHands[playerGuid];
		});

		await this.updateGame(newGame);

		return newGame;
	}

	public async playCard(gameId: string, playerGuid: string, cardId: number)
	{
		const existingGame = await this.getGame(gameId);

		const newGame = {...existingGame};
		newGame.players[playerGuid].whiteCards = newGame.players[playerGuid].whiteCards.filter(a => a !== cardId);
		newGame.usedWhiteCards.push(cardId);
		newGame.roundCards[playerGuid] = cardId;

		await this.updateGame(newGame);

		return newGame;
	}

	public async selectWinnerCard(gameId: string, playerGuid: string, whiteCardId: number)
	{
		const existingGame = await this.getGame(gameId);

		if (existingGame.chooserGuid !== playerGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		const winnerGuid = Object.values(newGame.players).find(p => p.whiteCards.includes(whiteCardId))?.guid;
		if (winnerGuid)
		{
			newGame.players[winnerGuid].wins = newGame.players[winnerGuid].wins + 1;

			await this.updateGame(newGame);

			return winnerGuid;
		}

		throw new Error("Invalid selection");
	}
}

export const GameManager = _GameManager.Instance;