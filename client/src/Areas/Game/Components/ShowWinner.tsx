import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Typography} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {Platform} from "../../../Global/Platform/platform";
import {WhiteCard} from "../../../UI/WhiteCard";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

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

		const sortedPlayerGuids = [...playerGuids].sort((a, b) => game.players[b].wins - game.players[a].wins);

		return (
			<>
				<Grid item xs={12} sm={6}>
					<WhiteCard style={{marginBottom: "0.5rem"}}>
						{winnerCards.map(card => card && (
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
					<div style={{marginTop: "1rem"}}>
						<Typography>Scoreboard</Typography>
						<List>
							{sortedPlayerGuids.map((pg, i) => (
								<>
									{i > 0 && i <= sortedPlayerGuids.length - 1 && (
										<Divider/>
									)}
									<ListItem>
										<ListItemAvatar>
											<Avatar>
												<strong>{game?.players[pg].wins}</strong>
											</Avatar>
										</ListItemAvatar>
										<ListItemText>
											<Typography>
												{game?.players[pg].nickname}
											</Typography>
										</ListItemText>
									</ListItem>
								</>
							))}
						</List>
					</div>
				</Grid>
			</>
		);
	}
}