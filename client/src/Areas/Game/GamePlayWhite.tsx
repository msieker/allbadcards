import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {IBlackCard, IWhiteCard, Platform} from "../../Global/Platform/platform";
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
	hasSelected: boolean;
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

export class GamePlayWhite extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			hasSelected: false,
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
		this.setState({
			hasSelected: true
		});

		GameDataStore.playWhiteCard(id, this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			userData,
			gameData,
			hasSelected
		} = this.state;

		const {
			players,
			roundCards,
			chooserGuid
		} = gameData.game ?? {};

		const me = players?.[userData.playerGuid];

		if (!me)
		{
			return null;
		}

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
			? `Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner...`
			: `These players have not picked cards: ${remainingPlayers.join(", ")}`;

		const hasWinner = !!gameData.game?.lastWinnerGuid;

		return (
			<>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{gameData.blackCardDef?.prompt}
						</BlackCard>
					</Grid>
					<RevealWhites canReveal={false}/>
				</Grid>
				<Divider style={{margin: "2rem 0"}}/>
				<div>
					<Typography>
						Card Czar: <strong>{chooser}</strong>
					</Typography>
				</div>
				{!hasWinner && (
					<div>
						<Typography>
							{waitingLabel}
						</Typography>
					</div>
				)}
				{selectedLoading && (
					<ContainerProgress/>
				)}
				<ShowWinner/>
				{!hasWinner && (
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