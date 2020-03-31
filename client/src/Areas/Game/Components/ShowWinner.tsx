import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Typography} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {Platform} from "../../../Global/Platform/platform";

interface IShowWinnerProps
{
}

interface DefaultProps
{
}

type Props = IShowWinnerProps & DefaultProps;
type State = IShowWinnerState;

interface IShowWinnerState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

export class ShowWinner extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private onClick = () =>
	{
		if (this.state.gameData.game?.id)
		{
			Platform.nextRound(this.state.gameData.game.id, this.state.userData.playerGuid)
				.catch(e => console.error(e));
		}
	};

	public render()
	{
		const game = this.state.gameData.game;
		const winnerGuid = game?.lastWinnerGuid;
		if (!winnerGuid || !game)
		{
			return null;
		}

		const playerGuids = Object.keys(game.players);

		const isChooser = game.chooserGuid === this.state.userData.playerGuid;

		const winner = game.players[winnerGuid];

		return (
			<div>
				<Typography>
					{winner?.nickname} won this round!
				</Typography>
				<div>
					<Typography>Scoreboard:</Typography>
					{playerGuids.map(pg => (
						<Typography>
							{game?.players[pg].nickname}: <strong>{game?.players[pg].wins}</strong>
						</Typography>
					))}
				</div>
				<Divider style={{margin: "1rem 0"}}/>
				{isChooser && (
					<Button color={"primary"} variant={"contained"} onClick={this.onClick}>Next round</Button>
				)}
			</div>
		);
	}
}