import {DataStore} from "./DataStore";
import {GameItem, Platform} from "../Platform/platform";
import {UserDataStore} from "./UserDataStore";

export interface IGameDataStorePayload
{
	game: GameItem | null;
}

class _GameDataStore extends DataStore<IGameDataStorePayload>
{
	public static Instance = new _GameDataStore({
		game: null
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

	public hydrate(gameId: string)
	{
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
		if (!this.state.game || !cardId)
		{
			throw new Error("Invalid card or game!");
		}

		Platform.playCard(this.state.game.id, userGuid, cardId)
			.catch(e => console.error(e));
	}

	public chooseWinner(cardId: number | undefined, userGuid: string)
	{
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
}

export const GameDataStore = _GameDataStore.Instance;