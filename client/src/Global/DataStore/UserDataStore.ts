import {DataStore} from "./DataStore";
import shortid from "shortid";

export interface IUserData
{
	wsId: string | null;
	playerGuid: string;
}

class _UserDataStore extends DataStore<IUserData>
{
	public static Instance = new _UserDataStore({
		playerGuid: _UserDataStore.generateGuid(),
		wsId: null
	});

	private ws: WebSocket;

	private static generateGuid()
	{
		return shortid.generate() + shortid.generate();
	}

	public initialize()
	{
		const url = `ws://${location.hostname}:8080`;
		this.ws = new WebSocket(url);

		this.ws.onopen = (e) =>
		{
			console.log(e);
		};

		this.ws.onmessage = (e) =>
		{
			console.log(e);
		};
	}
}

export const UserDataStore = _UserDataStore.Instance;