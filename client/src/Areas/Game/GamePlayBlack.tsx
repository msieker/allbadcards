import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {WhiteCard} from "../../UI/WhiteCard";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";
import Button from "@material-ui/core/Button";

interface IGamePlayBlackProps
{
}

interface DefaultProps
{
}

type Props = IGamePlayBlackProps & DefaultProps;
type State = IGamePlayBlackState;

interface IGamePlayBlackState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

export class GamePlayBlack extends React.Component<Props, State>
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

	private onSelect = (winningPlayerGuid: string) =>
	{
		GameDataStore.chooseWinner(this.state.userData.playerGuid, winningPlayerGuid);
	};

	private onClickStartRound = () =>
	{
		GameDataStore.startRound(this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			gameData,
			userData
		} = this.state;

		const me = gameData.game?.players?.[this.state.userData.playerGuid];

		const cardDefsLoaded = Object.values(gameData.game?.roundCards ?? {}).length === 0 || Object.keys(gameData.roundCardDefs).length > 0;

		if (!me || !gameData.game || !cardDefsLoaded)
		{
			return null;
		}

		const {
			players,
			chooserGuid,
			roundCards,
			roundStarted
		} = gameData.game;

		const roundCardKeys = Object.keys(roundCards ?? {});
		const roundCardValues = roundCardKeys
			.map(playerGuid => roundCards[playerGuid]
				.map(cardId => gameData.roundCardDefs[cardId]));

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const playersAreRemaining = remainingPlayerGuids.length > 0;

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);

		const revealedIndex = this.state.gameData.game?.revealIndex ?? 0;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < roundCardKeys.length;
		const revealFinished = revealedIndex === roundCardKeys.length;

		const waitingLabel = revealFinished && !playersAreRemaining
			? "Pick the winner"
			: timeToPick
				? `Reveal each white card...`
				: `Picking: ${remainingPlayers.join(", ")}`;

		const hasWinner = !!gameData.game?.lastWinner;

		return (
			<>
				<div>
					<Typography>
						Card Czar: <strong>You!</strong>
					</Typography>
					{!hasWinner && (
						<div>
							<Typography variant={"h5"}>
								{waitingLabel}
							</Typography>
						</div>
					)}
				</div>
				<Divider style={{margin: "1rem 0"}}/>
				{!roundStarted && (
					<Typography style={{marginBottom: "0.5rem", textAlign: "center"}}>Read the card aloud, then click Start The Round!</Typography>
				)}
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{gameData.blackCardDef?.prompt}
						</BlackCard>
					</Grid>
					<RevealWhites canReveal={true}/>
					<ShowWinner/>
				</Grid>
				{!roundStarted && (
					<div style={{marginTop: "1rem", textAlign: "center"}}>
						<Button color={"primary"} variant={"contained"} onClick={this.onClickStartRound}>
							Start the round!
						</Button>
					</div>
				)}
				{timeToPick && !revealMode && !hasWinner && (
					<>
						<Grid container spacing={2}>
							{roundCardKeys.map((playerGuid, i) => (
								<Grid item xs={12} sm={6}>
									<WhiteCard actions={(
										<Button
											variant={"contained"}
											color={"primary"}
											onClick={() => this.onSelect(playerGuid)}
										>
											Pick Winner
										</Button>
									)}>
										{roundCardValues[i].map(card => card && (
											<>
												<div>{card.response}</div>
												<Divider style={{margin: "1rem 0"}}/>
											</>
										))}
									</WhiteCard>
								</Grid>
							))}
						</Grid>
						<Divider style={{margin: "1rem 0"}}/>
					</>
				)}
			</>
		);
	}
}