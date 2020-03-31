import {Database} from "../DB/Database";
import shortid from "shortid";
import {CardManager} from "./CardManager";
import WebSocket from "ws";
import {GameMessage} from "../SocketMessages/GameMessage";
import {Express} from "express";
import * as http from "http";
import {Config} from "../config/config";

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
	roundIndex: number;
	ownerGuid: string;
	chooserGuid: string | null;
	started: boolean;
	dateCreated: Date;
	public: boolean;
	players: { [key: string]: GamePlayer };
	blackCard: number;
	// key = player guid, value = white card ID
	roundCards: { [key: string]: number };
	usedBlackCards: number[];
	usedWhiteCards: number[];
	revealIndex: number;
	lastWinnerGuid: string | undefined;
}

interface ICard
{
	id: number;
}

interface IBlackCard extends ICard
{
	prompt: string;
	special: string;
}

interface IWhiteCard extends ICard
{
	response: string;
}

export let GameManager: _GameManager;

class _GameManager
{
	private wss: WebSocket.Server;

	// key = playerGuid, value = WS key
	private wsClientPlayerMap: { [key: string]: string[] } = {};

	constructor(server: http.Server)
	{
		console.log("Starting WebSocket Server");

		Database.initialize();

		const port = Config.Environment === "local" ? {port: 8080} : undefined;

		this.wss = new WebSocket.Server({
			server,
			...port
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
					const existingConnections = this.wsClientPlayerMap[data.playerGuid] ?? [];
					this.wsClientPlayerMap[data.playerGuid] = [id, ...existingConnections];
				});

				ws.on("close", () => {
					const matchingPlayerGuid = Object.keys(this.wsClientPlayerMap)
						.find(playerGuid => this.wsClientPlayerMap[playerGuid].includes(id));

					if(matchingPlayerGuid)
					{
						const existingConnections = this.wsClientPlayerMap[matchingPlayerGuid];
						this.wsClientPlayerMap[matchingPlayerGuid] = existingConnections.filter(a => a !== id);
					}
				});
			}
		});
	}

	public static create(server: http.Server)
	{
		GameManager = new _GameManager(server);
	}

	private get games()
	{
		return Database.db.collection<GameItem>("games");
	}

	private createPlayer(playerGuid: string, nickname: string, isSpectating: boolean): GamePlayer
	{
		return {
			guid: playerGuid,
			whiteCards: [],
			nickname,
			wins: 0,
			isSpectating
		};
	}

	public async getGame(gameId: string)
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
		}, {
			$set: newGame
		});

		this.updateSocketGames(newGame);

		return newGame;
	}

	private updateSocketGames(game: GameItem)
	{
		const playerGuids = Object.keys(game.players);

		// Get every socket that needs updating
		const wsIds = playerGuids
			.map(pg => this.wsClientPlayerMap[pg])
			.reduce((acc, val) => acc.concat(val), []);

		this.wss.clients.forEach(ws =>
		{
			if (wsIds.includes((ws as any).id))
			{
				ws.send(GameMessage.send(game));
			}
		});
	}

	public async createGame(ownerGuid: string, nickname: string): Promise<GameItem>
	{
		console.log(`Creating game for ${ownerGuid}`);

		const gameId = shortid.generate();

		try
		{
			const initialGameItem: GameItem = {
				id: gameId,
				roundIndex: 0,
				ownerGuid,
				chooserGuid: null,
				dateCreated: new Date(),
				players: {[ownerGuid]: this.createPlayer(ownerGuid, nickname, false)},
				public: false,
				started: false,
				blackCard: -1,
				roundCards: {},
				usedBlackCards: [],
				usedWhiteCards: [],
				revealIndex: -1,
				lastWinnerGuid: undefined
			};

			const gameItem = CardManager.nextBlackCard(initialGameItem);

			await this.games.insertOne(gameItem);

			const game = await this.getGame(gameId);

			console.log(`Created game for ${ownerGuid}: ${game.id}`);

			this.updateSocketGames(game);

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
		newGame.players[playerGuid] = this.createPlayer(playerGuid, nickname, isSpectating);

		await this.updateGame(newGame);

		return newGame;
	}

	public async nextRound(gameId: string, chooserGuid: string)
	{
		const existingGame = await this.getGame(gameId);

		if (existingGame.chooserGuid !== chooserGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		newGame.lastWinnerGuid = undefined;
		newGame.revealIndex = -1;
		newGame.roundCards = {};
		newGame.roundIndex = existingGame.roundIndex + 1;

		const playerGuids = Object.keys(existingGame.players);
		const chooserIndex = newGame.roundIndex % playerGuids.length;
		const chooser = playerGuids[chooserIndex];

		newGame.chooserGuid = chooser;

		const newHands = await CardManager.dealWhiteCards(newGame);
		Object.keys(newGame.players).forEach(playerGuid =>
		{
			newGame.players[playerGuid].whiteCards = newHands[playerGuid];
		});

		const newGameWithBlackCard = CardManager.nextBlackCard(newGame);

		await this.updateGame(newGameWithBlackCard);

		return newGame;
	}

	public async startGame(gameId: string, ownerGuid: string)
	{
		const existingGame = await this.getGame(gameId);

		if (existingGame.ownerGuid !== ownerGuid)
		{
			throw new Error("User cannot start game");
		}

		const newHands = await CardManager.dealWhiteCards(existingGame);
		const newGame = {...existingGame};

		const playerGuids = Object.keys(existingGame.players);
		newGame.chooserGuid = playerGuids[0];
		newGame.started = true;

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
		newGame.usedWhiteCards.push(cardId);
		newGame.roundCards[playerGuid] = cardId;

		await this.updateGame(newGame);

		return newGame;
	}

	public async revealNext(gameId: string, playerGuid: string)
	{
		const existingGame = await this.getGame(gameId);

		const newGame = {...existingGame};
		newGame.revealIndex = newGame.revealIndex + 1;

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
			newGame.lastWinnerGuid = winnerGuid;

			await this.updateGame(newGame);

			return winnerGuid;
		}

		throw new Error("Invalid selection");
	}
}

export const CreateGameManager = _GameManager.create;
