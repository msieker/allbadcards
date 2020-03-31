import {DataStore} from "./DataStore";
import {GameItem, IBlackCard, IWhiteCard, Platform} from "../Platform/platform";
import {UserDataStore} from "./UserDataStore";
import deepEqual from "deep-equal";

export type WhiteCardMap = { [cardId: number]: IWhiteCard };

export interface IGameDataStorePayload
{
	game: GameItem | null;
	roundCardDefs: WhiteCardMap;
	playerCardDefs: WhiteCardMap;
	blackCardDef: IBlackCard | null;
}

class _GameDataStore extends DataStore<IGameDataStorePayload>
{
	public static Instance = new _GameDataStore({
		game: null,
		roundCardDefs: {},
		playerCardDefs: {},
		blackCardDef: null
	});

	private ws: WebSocket | null = null;

	public initialize()
	{
		const isLocal = !!location.hostname.match("local");
		const url = isLocal ? `ws://${location.hostname}:8080` : `ws://${location.hostname}`;
		this.ws = new WebSocket(url);

		this.ws.onopen = (e) =>
		{
			console.log(e);
			this.ws?.send(JSON.stringify(UserDataStore.state));
		};

		this.ws.onmessage = (e) =>
		{
			const data = JSON.parse(e.data);
			this.update(data);
		};
	}

	protected update(data: Partial<IGameDataStorePayload>)
	{
		let prev = {...this.state};

		super.update(data);

		console.groupCollapsed("[GameDataStore] Update...");
		console.log("New: ", data);
		console.log("Prev: ", prev);
		console.log("Result:", this.state);
		console.groupEnd();

		const meGuid = UserDataStore.state.playerGuid;

		if (!deepEqual(prev.game?.roundCards, this.state.game?.roundCards))
		{
			this.loadRoundCards();
		}

		if (!deepEqual(prev.game?.players[meGuid], this.state.game?.players[meGuid]))
		{
			this.loadPlayerCards(meGuid);
		}

		if(prev.game?.blackCard !== this.state.game?.blackCard)
		{
			this.loadBlackCard();
		}
	}

	private loadRoundCards()
	{
		const toLoad = this.state.game?.roundCards;
		if(!toLoad)
		{
			return;
		}

		const cardIds = Object.values(toLoad);

		this.loadWhiteCardMap(cardIds)
			.then(roundCardDefs => this.update({
				roundCardDefs
			}));
	}

	private loadPlayerCards(playerGuid: string)
	{
		const toLoad = this.state.game?.players[playerGuid].whiteCards;
		if(!toLoad)
		{
			return;
		}

		const cardIds = Object.values(toLoad);

		this.loadWhiteCardMap(cardIds)
			.then(playerCardDefs => this.update({
				playerCardDefs
			}));
	}

	private loadBlackCard()
	{
		Platform.getBlackCard(this.state.game?.blackCard!)
			.then(blackCardDef => this.update({
				blackCardDef
			}));
	}

	private async loadWhiteCardMap(cardIds: number[]): Promise<WhiteCardMap>
	{
		const data = await Platform.getWhiteCards(cardIds);
		const map = data.reduce((acc, item) =>
		{
			acc[item.id] = item;
			return acc;
		}, {} as WhiteCardMap);

		return map;
	}

	public hydrate(gameId: string)
	{
		console.log("[GameDataStore] Hydrating...", gameId);

		Platform.getGame(gameId)
			.then(data =>
			{
				this.update({
					game: data
				});
			})
			.catch(e => console.error(e));
	}

	public playWhiteCard(cardId: number | undefined, userGuid: string)
	{
		console.log("[GameDataStore] Played white card...", cardId, userGuid);

		if (!this.state.game || !cardId)
		{
			throw new Error("Invalid card or game!");
		}

		Platform.playCard(this.state.game.id, userGuid, cardId)
			.catch(e => console.error(e));
	}

	public chooseWinner(cardId: number | undefined, userGuid: string)
	{
		console.log("[GameDataStore] Choosing winner...", cardId, userGuid);

		if (!this.state.game || !cardId)
		{
			throw new Error("Invalid card or game!");
		}

		Platform.selectWinnerCard(this.state.game.id, userGuid, cardId)
			.catch(e => console.error(e));
	}

	public revealNext(userGuid: string)
	{
		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		Platform.revealNext(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}

	public startRound(userGuid: string)
	{
		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		Platform.startRound(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}
}

export const GameDataStore = _GameDataStore.Instance;