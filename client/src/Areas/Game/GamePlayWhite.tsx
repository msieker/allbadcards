import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {WhiteCard} from "../../UI/WhiteCard";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";
import Button from "@material-ui/core/Button";
import {Confirmation} from "./Components/Confirmation";
import {WhiteCardHand} from "./Components/WhiteCardHand";
import Tooltip from "@material-ui/core/Tooltip";
import LinearProgress from "@material-ui/core/LinearProgress";

interface IGamePlayWhiteProps
{
}

interface DefaultProps
{
}

type Props = IGamePlayWhiteProps & DefaultProps;
type State = IGamePlayWhiteState;

interface IGamePlayWhiteState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	didForfeit: boolean;
	pickedCards: number[];
	canUseMyCardsSuck: boolean;
}

export class GamePlayWhite extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			pickedCards: [],
			didForfeit: false,
			canUseMyCardsSuck: this.determineCanUseMyCardsSuck(GameDataStore.state.game?.roundIndex ?? 0, GameDataStore.state.game?.id)
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

	public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void
	{
		const prevRoundIndex = prevState.gameData.game?.roundIndex;
		const currentRoundIndex = this.state.gameData.game?.roundIndex ?? 0;

		if (prevRoundIndex !== currentRoundIndex)
		{
			this.setState({
				pickedCards: [],
				didForfeit: false
			});

			const canUseMyCardsSuck = this.determineCanUseMyCardsSuck(currentRoundIndex, this.state.gameData.game?.id);

			this.setState({
				canUseMyCardsSuck
			});
		}
	}

	private determineCanUseMyCardsSuck(currentRoundIndex: number, gameId: string | undefined)
	{
		if (!gameId)
		{
			return false;
		}

		const lastUsedCardsSuckIndex = parseInt(localStorage.getItem(this.getCardsSuckLsKey(gameId)) ?? "-99");
		const diff = currentRoundIndex - lastUsedCardsSuckIndex;

		return diff >= 5;
	}

	private onCommit = () =>
	{
		const hasSelected = this.state.userData.playerGuid in (this.state.gameData.game?.roundCards ?? {});
		if (hasSelected)
		{
			return;
		}

		GameDataStore.playWhiteCards(this.state.pickedCards, this.state.userData.playerGuid);
	};

	private onPickUpdate = (pickedCards: number[]) =>
	{
		this.setState({
			pickedCards
		});
	};

	private getCardsSuckLsKey(gameId: string)
	{
		return `cards-suck-last-round-index:${gameId}`;
	}

	private onForfeit = () =>
	{
		const didConfirm = confirm("" +
			"You could still win this round, but we'll automatically play a random selection from your hand, then give you new cards. " +
			"Do you really want to do that?");
		if (didConfirm)
		{
			this.setState({
				didForfeit: true
			});

			const gameId = this.state.gameData.game?.id;

			if (gameId)
			{
				localStorage.setItem(this.getCardsSuckLsKey(gameId), String(this.state.gameData.game?.roundIndex ?? 0));
			}

			GameDataStore.forfeit(this.state.userData.playerGuid, this.getTargetPickNeeded());
		}
	};

	private getTargetPickNeeded()
	{
		const special = this.state.gameData.blackCardDef?.special;
		let targetPicked = 1;
		switch (special)
		{
			case "DRAW 2, PICK 3":
				targetPicked = 3;
				break;

			case "PICK 2":
				targetPicked = 2;
				break;
		}

		return targetPicked;
	}

	public render()
	{
		const {
			userData,
			gameData,
			canUseMyCardsSuck,
			didForfeit
		} = this.state;

		if (!gameData.game)
		{
			return null;
		}

		const {
			players,
			roundCards,
			chooserGuid,
			roundStarted
		} = gameData.game;

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const playersAreRemaining = remainingPlayerGuids.length > 0;
		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const waitingLabel = remainingPlayers.length === 0
			? `Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner.`
			: `Picking: ${remainingPlayers.join(", ")}`;

		const hasPlayed = userData.playerGuid in roundCards;

		const hasWinner = !!gameData.game?.lastWinner;

		let targetPicked = 1;
		switch (gameData.blackCardDef?.special)
		{
			case "DRAW 2, PICK 3":
				targetPicked = 3;
				break;

			case "PICK 2":
				targetPicked = 2;
				break;
		}

		const metPickTarget = targetPicked <= this.state.pickedCards.length;
		const revealTime = !playersAreRemaining && gameData.game.revealIndex >= 0 && gameData.game.revealIndex <= Object.keys(roundCards).length;

		return (
			<div style={{paddingBottom: "4rem"}}>
				<div>
					<Typography>
						Card Czar: <strong>{chooser}</strong>
					</Typography>
					{!hasWinner && (
						<div style={{marginBottom: "1rem"}}>
							<Typography>
								{waitingLabel}
							</Typography>
						</div>
					)}
				</div>
				<Divider style={{margin: "1rem 0"}}/>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					{roundStarted &&
                    <Grid item xs={12} sm={6}>
                        <BlackCard>
							{gameData.blackCardDef?.prompt}
                        </BlackCard>
                    </Grid>
					}
					{!roundStarted && (
						<Typography>Waiting for the round to start...</Typography>
					)}
					<RevealWhites canReveal={false}/>
					<ShowWinner/>
				</Grid>
				<Divider style={{margin: "1rem 0"}}/>
				{!hasWinner && roundStarted && !revealTime && (
					<Grid container spacing={2}>
						<WhiteCardHand
							gameData={gameData}
							userData={userData}
							targetPicked={targetPicked}
							onPickUpdate={this.onPickUpdate}
						/>

						{!hasPlayed && !didForfeit && !revealTime && (
							<Grid item xs={12} style={{display: "flex", justifyContent: "center", padding: "4rem 0 2rem"}}>
								<Tooltip enterTouchDelay={0} enterDelay={0} title={canUseMyCardsSuck ? "Forfeit round and get new cards?" : "You can only do this every 5 rounds"} arrow>
									<div>
										<Button
											size={"large"}
											variant={"contained"}
											color={"primary"}
											disabled={hasPlayed || revealTime || !roundStarted || !canUseMyCardsSuck}
											onClick={this.onForfeit}
											style={{
												marginLeft: "0.5rem"
											}}
										>
											My cards suck
										</Button>
									</div>
								</Tooltip>
							</Grid>
						)}
					</Grid>
				)}

				{!hasPlayed && !didForfeit && !revealTime && metPickTarget && (
					<Confirmation>
						<Button
							size={"large"}
							variant={"contained"}
							color={"primary"}
							onClick={this.onCommit}
						>
							Play
						</Button>
					</Confirmation>
				)}
			</div>
		);
	}
}