import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {WhiteCard} from "../../../UI/WhiteCard";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";

interface IRevealWhitesProps
{
	canReveal: boolean;
}

interface DefaultProps
{
}

type Props = IRevealWhitesProps & DefaultProps;
type State = IRevealWhitesState;

interface IRevealWhitesState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

export class RevealWhites extends React.Component <Props, State>
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

	private onReveal = () =>
	{
		GameDataStore.revealNext(this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			gameData,
		} = this.state;

		const whiteCards = Object.values(gameData.roundCardDefs);
		const roundCardKeys = Object.keys(gameData.game?.roundCards ?? {});
		const game = gameData.game;
		const roundPlayers = Object.keys(game?.roundCards ?? {});
		const remainingPlayerGuids = Object.keys(game?.players ?? {})
			.filter(pg => !(pg in (game?.roundCards ?? {})) && pg !== game?.chooserGuid);
		const remainingPlayers = remainingPlayerGuids.map(pg => game?.players?.[pg]?.nickname);
		const realRevealIndex = game?.revealIndex ?? 0;
		const revealedIndex = (realRevealIndex + (game?.randomOffset ?? 0)) % roundPlayers.length;
		const cardsIdsRevealed = game?.roundCards[roundPlayers[revealedIndex]] ?? [];
		const cardsRevealed = cardsIdsRevealed.map(cid => whiteCards.find(c => c.id === cid)!);
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && realRevealIndex < roundCardKeys.length;

		if (!revealMode)
		{
			return null;
		}

		return (
			<Grid item xs={12} sm={6}>
				{realRevealIndex >= 0 && (
					<>
						<WhiteCard key={revealedIndex} style={{marginBottom: "0.5rem"}}>
							{cardsRevealed.map(card => (
								<>
									<div>{card.response}</div>
									<Divider style={{margin: "1rem 0"}}/>
								</>
							))}
							{this.props.canReveal && (
								<Button color={"primary"} variant={"contained"} onClick={this.onReveal}>
									Next
								</Button>
							)}
						</WhiteCard>
					</>
				)}
				{realRevealIndex === -1 && this.props.canReveal && (
					<Button color={"primary"} variant={"contained"} onClick={this.onReveal}>Show me the cards!</Button>
				)}
			</Grid>
		);
	}
}