import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData} from "../../Global/DataStore/UserDataStore";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import {IBlackCard, IWhiteCard, Platform} from "../../Global/Platform/platform";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {WhiteCard} from "../../UI/WhiteCard";
import Button from "@material-ui/core/Button";

interface IGamePlayBlackProps
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

interface DefaultProps
{
}

type Props = IGamePlayBlackProps & DefaultProps;
type State = IGamePlayBlackState;

type WhiteCardMap = { [cardId: string]: IWhiteCard };

interface IGamePlayBlackState
{
	whiteCards: WhiteCardMap;
	blackCard: IBlackCard | undefined;
}

export class GamePlayBlack extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			whiteCards: {},
			blackCard: undefined,
		};
	}

	public componentDidMount(): void
	{
		const {
			blackCard,
			roundCards
		} = this.props.gameData.game ?? {};

		this.loadCards(
			blackCard,
			Object.values(roundCards ?? {})
		);
	}

	public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void
	{
		const {
			playerGuid
		} = this.props.userData;

		const {
			blackCard,
			roundCards,
			players
		} = this.props.gameData.game ?? {};

		const whiteCards = Object.values(roundCards ?? {});
		const oldWhiteCards = Object.values(prevProps.gameData.game?.roundCards ?? {});
		const hasNewCards = whiteCards.length !== oldWhiteCards.length;

		if (hasNewCards)
		{
			this.loadCards(
				blackCard,
				whiteCards ?? []
			);
		}
	}

	private loadCards(blackCard: number | undefined, whiteCards: number[])
	{
		if (blackCard)
		{
			Platform.getBlackCard(blackCard)
				.then(card =>
				{
					this.setState({
						blackCard: card
					});
				});
		}

		Platform.getWhiteCards(whiteCards)
			.then(cards =>
			{
				const fixedCards = cards.reduce((all, item) =>
				{
					all[item.id] = item;
					return all;
				}, {} as WhiteCardMap);

				this.setState({
					whiteCards: fixedCards
				});
			});
	}

	private onSelect = (cardId: number) =>
	{
	};

	private onReveal = () =>
	{
		GameDataStore.revealNext(this.props.userData.playerGuid);
	};

	public render()
	{
		const {
			players,
			chooserGuid,
			roundCards
		} = this.props.gameData.game ?? {};

		const me = players?.[this.props.userData.playerGuid];

		if (!me)
		{
			return null;
		}

		const whiteCards = Object.keys(this.state.whiteCards)
			.map(cardId => this.state.whiteCards[cardId]);

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const revealedIndex = this.props.gameData.game?.revealIndex ?? 0;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < whiteCards.length;

		const waitingLabel = timeToPick
			? `Waiting for you to pick the winner...`
			: `Waiting for: ${remainingPlayers.join(", ")}`;

		return (
			<>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{this.state.blackCard?.prompt}
						</BlackCard>
					</Grid>
					{revealMode && (
						<Grid item xs={12} sm={6}>
							<WhiteCard key={revealedIndex}>
								{whiteCards[revealedIndex].response}
								<Divider style={{margin: "1rem 0"}} />
								<Button color={"primary"} variant={"contained"} onClick={this.onReveal}>Next</Button>
							</WhiteCard>
						</Grid>
					)}
				</Grid>
				<Divider style={{margin: "2rem 0"}}/>
				<div>
					<Typography>
						Black Card: {chooser}
					</Typography>
				</div>
				<div>
					<Typography>
						{waitingLabel}
					</Typography>
				</div>
				{timeToPick && !revealMode && (
					<Grid container spacing={2}>
						{whiteCards.map(card => (
							<Grid item xs={12} sm={6}>
								<WhiteCard key={card.id} onSelect={timeToPick ? () => this.onSelect(card.id) : undefined}>
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