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

	public async createGame(ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/create-game", {
			ownerGuid
		});
	}

	public async joinGame(playerGuid: string, gameId: string, nickname: string, isSpectating = false)
	{
		return _Platform.doPost<GameItem>("/join-game", {
			gameId,
			nickname,
			isSpectating
		});
	}

	public async playCard(gameId: string, playerGuid: string, cardId: string)
	{
		return _Platform.doPost<GameItem>("/join-game", {
			gameId,
			playerGuid,
			cardId
		});
	}

	public async selectWinnerCard(gameId: string, playerGuid: string, whiteCardId: string)
	{
		return _Platform.doPost<GameItem>("/join-game", {
			gameId,
			playerGuid,
			whiteCardId
		});
	}
}

export const Platform = _Platform.Instance;