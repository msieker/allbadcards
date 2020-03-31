import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {WhiteCard} from "../../UI/WhiteCard";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import Divider from "@material-ui/core/Divider";
import {ContainerProgress} from "../../UI/ContainerProgress";
import {Typography} from "@material-ui/core";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";

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
}

export class GamePlayWhite extends React.Component<Props, State>
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

	private onSelect = (id: number) =>
	{
		const hasSelected = this.state.userData.playerGuid in (this.state.gameData.game?.roundCards ?? {});
		if(hasSelected)
		{
			return;
		}

		GameDataStore.playWhiteCard(id, this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			userData,
			gameData,
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

		if (!me)
		{
			return null;
		}

		const hasSelected = userData.playerGuid in roundCards;
		const whiteCards = Object.values(gameData.playerCardDefs);

		const selectedCard = roundCards?.[me.guid];

		const renderedWhiteCards = selectedCard
			? whiteCards.filter(c => c.id === selectedCard)
			: whiteCards;

		const selectedLoading = hasSelected && !selectedCard;

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const waitingLabel = remainingPlayers.length === 0
			? `Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner. You played:`
			: `These players have not picked cards: ${remainingPlayers.join(", ")}`;

		const hasWinner = !!gameData.game?.lastWinner;

		return (
			<>
				<div>
					<Typography>
						Card Czar: <strong>{chooser}</strong>
					</Typography>
				</div>
				<Divider style={{margin: "2rem 0"}}/>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					{roundStarted &&
						<Grid item xs={12} sm={6}>
							<BlackCard>
								{gameData.blackCardDef?.prompt}
							</BlackCard>
						</Grid>
					}
					{!roundStarted &&
						<Typography>Waiting for the round to start...</Typography>
					}
					<RevealWhites canReveal={false}/>
					<ShowWinner/>
				</Grid>
				<Divider style={{margin: "2rem 0"}}/>
				{!hasWinner && (
					<div style={{marginBottom: "1rem"}}>
						<Typography>
							{waitingLabel}
						</Typography>
					</div>
				)}
				{selectedLoading && (
					<ContainerProgress/>
				)}
				{!hasWinner && roundStarted && (
					<Grid container spacing={2}>
						{renderedWhiteCards.map(card => (
							<Grid item xs={12} sm={6}>
								<WhiteCard key={card.id} onSelect={() => this.onSelect(card.id)}>
									{card.response}
								</WhiteCard>
							</Grid>
						))}
					</Grid>
				)}
			</>
		);
	}
}