import {ErrorDataStore} from "../DataStore/ErrorDataStore";

type PlayerMap = { [key: string]: GamePlayer };

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
	roundStarted: boolean;
	ownerGuid: string;
	chooserGuid: string | null;
	started: boolean;
	dateCreated: Date;
	public: boolean;
	players: PlayerMap;
	blackCard: number;
	// key = player guid, value = white card ID
	roundCards: { [key: string]: number[] };
	usedBlackCards: number[];
	usedWhiteCards: number[];
	revealIndex: number;
	lastWinner: {
		playerGuid: string;
		whiteCardIds: number[];
	} | undefined;
	randomOffset: number;
}

export interface ICard
{
	id: number;
}

export interface IBlackCard extends ICard
{
	prompt: string;
	special: string;
}

export interface IWhiteCard extends ICard
{
	response: string;
}


class _Platform
{
	public static Instance = new _Platform();

	private loadedWhiteCards: { [cardId: string]: IWhiteCard } = {};

	private static async doGet<TData>(url: string)
	{
		return await fetch(url)
			.then(async r =>
			{
				if (r.ok)
				{
					return r.json();
				}
				else
				{
					throw await r.json();
				}
			})
			.catch(ErrorDataStore.add) as Promise<TData>;
	}

	private static async doPost<TData>(url: string, data: any)
	{
		return await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		})
			.then(async r =>
			{
				if (r.ok)
				{
					return r.json();
				}
				else
				{
					throw await r.json();
				}
			})
			.catch(ErrorDataStore.add) as Promise<TData>;
	}

	public async getGame(gameId: string)
	{
		return _Platform.doGet<GameItem>(`/api/game/get?gameId=${gameId}`);
	}

	public async createGame(ownerGuid: string, nickname: string)
	{
		return _Platform.doPost<GameItem>("/api/game/create", {
			ownerGuid,
			nickname
		});
	}

	public async joinGame(playerGuid: string, gameId: string, nickname: string, isSpectating = false)
	{
		return _Platform.doPost<GameItem>("/api/game/join", {
			playerGuid,
			gameId,
			nickname,
			isSpectating
		});
	}

	public async removePlayer(gameId: string, targetGuid: string, playerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/kick", {
			gameId,
			targetGuid,
			playerGuid
		});
	}

	public async startGame(ownerGuid: string, gameId: string)
	{
		return _Platform.doPost<GameItem>("/api/game/start", {
			gameId,
			ownerGuid,
		});
	}

	public async playCards(gameId: string, playerGuid: string, cardIds: number[])
	{
		return _Platform.doPost<GameItem>("/api/game/play-cards", {
			gameId,
			playerGuid,
			cardIds
		});
	}

	public async selectWinnerCard(gameId: string, playerGuid: string, winningPlayerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/select-winner-card", {
			gameId,
			playerGuid,
			winningPlayerGuid
		});
	}

	public async revealNext(gameId: string, ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/reveal-next", {
			gameId,
			ownerGuid,
		});
	}

	public async startRound(gameId: string, ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/start-round", {
			gameId,
			ownerGuid,
		});
	}

	public async nextRound(gameId: string, playerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/next-round", {
			gameId,
			playerGuid,
		});
	}

	public async getWhiteCard(cardId: number)
	{
		return new Promise<IWhiteCard>((resolve, reject) =>
		{
			if (cardId in this.loadedWhiteCards)
			{
				resolve(this.loadedWhiteCards[cardId]);
			}
			else
			{
				_Platform.doGet<IWhiteCard>(`/api/game/get-white-card?cardId=${cardId}`)
					.then(data => resolve(data))
					.catch(e => reject(e));
			}
		})
	}

	public async getBlackCard(cardId: number)
	{
		return _Platform.doGet<IBlackCard>(`/api/game/get-black-card?cardId=${cardId}`);
	}

	public async getWhiteCards(cardIds: number[])
	{
		const promises = cardIds.map(cardId => this.getWhiteCard(cardId));

		return Promise.all(promises);
	}
}

export const Platform = _Platform.Instance;