import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import {IWhiteCard} from "../../Global/Platform/platform";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {WhiteCard} from "../../UI/WhiteCard";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";

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

	private onSelect = (cardId: number) =>
	{
		GameDataStore.chooseWinner(cardId, this.state.userData.playerGuid);
	};

	private onReveal = () =>
	{
		GameDataStore.revealNext(this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			gameData,
			userData
		} = this.state;

		const {
			players,
			chooserGuid,
			roundCards
		} = gameData.game ?? {};

		const me = players?.[this.state.userData.playerGuid];

		if (!me)
		{
			return null;
		}

		const whiteCards = Object.values(gameData.roundCardDefs);

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const revealedIndex = this.state.gameData.game?.revealIndex ?? 0;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < whiteCards.length;
		const revealFinished = revealedIndex === whiteCards.length;

		const waitingLabel = revealFinished
			? "Pick the winner:"
			: timeToPick
				? `Reveal each white card...`
				: `Waiting for: ${remainingPlayers.join(", ")}`;

		const hasWinner = !!gameData.game?.lastWinnerGuid;

		return (
			<>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{gameData.blackCardDef?.prompt}
						</BlackCard>
					</Grid>
					<RevealWhites canReveal={true}/>
				</Grid>
				<Divider style={{margin: "2rem 0"}}/>
				<div>
					<Typography>
						Card Czar: <strong>{chooser}</strong>
					</Typography>
				</div>
				{!hasWinner && (
					<div>
						<Typography variant={"h5"} style={{margin: "1rem 0"}}>
							{waitingLabel}
						</Typography>
					</div>
				)}
				<ShowWinner/>
				{timeToPick && !revealMode && !hasWinner && (
					<Grid container spacing={2}>
						{whiteCards.map(card => (
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