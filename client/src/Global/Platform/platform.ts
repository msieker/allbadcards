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
	started: boolean;
	// key = player guid, value = white card ID
	roundCards: { [key: string]: number };
	usedBlackCards: number[];
	usedWhiteCards: number[];
	revealIndex: number;
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
			.then(r => r.json()) as Promise<TData>;
	}

	private static async doPost<TData>(url: string, data: any)
	{
		return await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}).then(r => r.json()) as Promise<TData>;
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

	public async startGame(ownerGuid: string, gameId: string)
	{
		return _Platform.doPost<GameItem>("/api/game/start", {
			gameId,
			ownerGuid,
		});
	}

	public async playCard(gameId: string, playerGuid: string, cardId: number)
	{
		return _Platform.doPost<GameItem>("/api/game/play-card", {
			gameId,
			playerGuid,
			cardId
		});
	}

	public async selectWinnerCard(gameId: string, playerGuid: string, whiteCardId: number)
	{
		return _Platform.doPost<GameItem>("/api/game/select-winner-card", {
			gameId,
			playerGuid,
			whiteCardId
		});
	}

	public async revealNext(gameId: string, ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/reveal-next", {
			gameId,
			ownerGuid,
		});
	}

	public async getWhiteCard(cardId: number)
	{
		return new Promise<IWhiteCard>((resolve, reject) => {
			if(cardId in this.loadedWhiteCards)
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