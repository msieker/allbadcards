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

interface IGamePlayWhiteProps
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

interface DefaultProps
{
}

type Props = IGamePlayWhiteProps & DefaultProps;
type State = IGamePlayWhiteState;

type WhiteCardMap = { [cardId: string]: IWhiteCard };

interface IGamePlayWhiteState
{
	whiteCards: WhiteCardMap;
	blackCard: IBlackCard | undefined;
	hasSelected: boolean;
}

export class GamePlayWhite extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			whiteCards: {},
			blackCard: undefined,
			hasSelected: false
		};
	}

	public componentDidMount(): void
	{
		const {
			playerGuid
		} = this.props.userData;

		const {
			blackCard,
			players
		} = this.props.gameData.game ?? {};

		const me = players?.[playerGuid];

		this.loadCards(
			blackCard,
			me?.whiteCards ?? []
		);
	}

	public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void
	{
		const {
			playerGuid
		} = this.props.userData;

		const {
			blackCard,
			players
		} = this.props.gameData.game ?? {};

		const oldPlayers = prevProps.gameData.game?.players ?? {};

		const me = players?.[playerGuid];
		const oldMe = oldPlayers?.[playerGuid];
		const newCards = me?.whiteCards.filter(c => !oldMe.whiteCards.includes(c));
		const newCardCount = newCards?.length ?? 0;

		if (newCardCount > 0)
		{
			this.loadCards(
				blackCard,
				me?.whiteCards ?? []
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

	private onSelect = (id: number) =>
	{
		this.setState({
			hasSelected: true
		});

		GameDataStore.playWhiteCard(id, this.props.userData.playerGuid);
	};

	public render()
	{
		const {
			players,
			roundCards,
			chooserGuid
		} = this.props.gameData.game ?? {};

		const me = players?.[this.props.userData.playerGuid];

		if (!me)
		{
			return null;
		}

		const whiteCards = Object.keys(this.state.whiteCards)
			.map(cardId => this.state.whiteCards[cardId]);

		const selectedCard = roundCards?.[me.guid];

		const renderedWhiteCards = selectedCard
			? whiteCards.filter(c => c.id === selectedCard)
			: whiteCards;

		const selectedLoading = this.state.hasSelected && !selectedCard;

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const waitingLabel = remainingPlayers.length === 0
			? `Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner...`
			: `Waiting for: ${remainingPlayers.join(", ")}`;

		return (
			<>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{this.state.blackCard?.prompt}
						</BlackCard>
					</Grid>
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
				{selectedLoading && (
					<ContainerProgress/>
				)}
				<Grid container spacing={2}>
					{renderedWhiteCards.map(card => (
						<Grid item xs={12} sm={6}>
							<WhiteCard key={card.id} onSelect={() => this.onSelect(card.id)}>
								{card.response}
							</WhiteCard>
						</Grid>
					))}
				</Grid>
			</>
		);
	}
}