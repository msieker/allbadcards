import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Typography} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {Platform} from "../../../Global/Platform/platform";
import {WhiteCard} from "../../../UI/WhiteCard";
import Grid from "@material-ui/core/Grid";

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
		const lastWinner = game?.lastWinner;
		const winnerCardIds = lastWinner?.whiteCardIds ?? [];
		const winnerCards = winnerCardIds.map(cardId => this.state.gameData.roundCardDefs?.[cardId]);
		if (!lastWinner || !game || winnerCards.length === 0)
		{
			return null;
		}

		const playerGuids = Object.keys(game.players);

		const isChooser = game.chooserGuid === this.state.userData.playerGuid;

		const winner = game.players[lastWinner.playerGuid];

		return (
			<>
				<Grid item xs={12} sm={6}>
					<WhiteCard style={{marginBottom: "0.5rem"}}>
						{winnerCards.map(card => (
							<>
								<div>{card.response}</div>
								<Divider/>
							</>
						))}
					</WhiteCard>
				</Grid>
				<Grid item xs={12} sm={12}>
					{isChooser && (
						<div style={{marginBottom: "2rem", textAlign: "center"}}>
							<Button size={"large"} color={"primary"} variant={"contained"} onClick={this.onClick}>
								Start Next round
							</Button>
						</div>
					)}
					<Divider style={{margin: "1rem 0"}}/>
					<Typography variant={"h4"}>
						Winner: {winner?.nickname}!
					</Typography>
					<div>
						<Typography>Scoreboard:</Typography>
						{playerGuids.map(pg => (
							<Typography>
								{game?.players[pg].nickname}: <strong>{game?.players[pg].wins}</strong>
							</Typography>
						))}
					</div>
				</Grid>
			</>
		);
	}
}