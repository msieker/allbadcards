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
	pickedCards: number[];
}

export class GamePlayWhite extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			pickedCards: []
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

	private onCommit = () =>
	{
		const hasSelected = this.state.userData.playerGuid in (this.state.gameData.game?.roundCards ?? {});
		if (hasSelected)
		{
			return;
		}

		GameDataStore.playWhiteCards(this.state.pickedCards, this.state.userData.playerGuid);
	};

	private onPick = (id: number) =>
	{
		this.setState({
			pickedCards: [...this.state.pickedCards, id]
		});
	};

	private onUnpick = (id: number) =>
	{
		this.setState({
			pickedCards: this.state.pickedCards.filter(a => a !== id)
		});
	};

	public render()
	{
		const {
			userData,
			gameData,
			pickedCards
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

		const me = players?.[userData.playerGuid];

		const cardDefsLoaded = Object.values(gameData.game?.roundCards ?? {}).length === 0 || Object.keys(gameData.roundCardDefs).length > 0;

		if (!me || !cardDefsLoaded)
		{
			return null;
		}

		const whiteCards = Object.values(gameData.playerCardDefs);

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const waitingLabel = remainingPlayers.length === 0
			? `Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner. You played:`
			: `Picking: ${remainingPlayers.join(", ")}`;

		const hasPlayed = userData.playerGuid in roundCards;

		const renderedWhiteCards = hasPlayed
			? roundCards[userData.playerGuid].map(cid => gameData.roundCardDefs[cid]).filter(a => !!a)
			: whiteCards;

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
				{!hasWinner && roundStarted && (
					<Grid container spacing={2}>
						{renderedWhiteCards.map(card =>
						{
							const pickedIndex = pickedCards.indexOf(card.id);
							const picked = pickedIndex > -1;
							const label = picked
								? targetPicked > 1
									? `Picked: ${pickedIndex + 1}`
									: "Picked"
								: "Pick";

							return (
								<Grid item xs={12} sm={6}>
									<WhiteCard
										key={card.id}
										actions={<>
											{!hasPlayed && (
												<>
													<Button
														variant={"contained"}
														color={"primary"}
														disabled={metPickTarget || pickedCards.includes(card.id)}
														onClick={() => this.onPick(card.id)}
													>
														{label}
													</Button>
													<Button
														variant={"contained"}
														color={"primary"}
														disabled={!pickedCards.includes(card.id)}
														onClick={() => this.onUnpick(card.id)}
													>
														Unpick
													</Button>
												</>
											)}
										</>}
									>
										{card.response}
									</WhiteCard>
								</Grid>
							);
						})}
					</Grid>
				)}
				{!hasPlayed && metPickTarget && (
					<Confirmation>
						<Button
							size={"large"}
							variant={"contained"}
							color={"secondary"}
							disabled={!metPickTarget}
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