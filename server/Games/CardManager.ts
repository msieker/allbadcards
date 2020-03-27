import {GameItem, GameManager} from "./GameManager";
import fs from "fs";
import * as path from "path";

interface ICard
{
	id: number;
}

interface IBlackCard extends ICard
{
	prompt: string;
	special: string;
}

interface IWhiteCard extends ICard
{
	response: string;
}

export class CardManager
{
	public static blackCards: IBlackCard[];
	public static whiteCards: IWhiteCard[];

	public static initialize()
	{
		const blackCardsFile = fs.readFileSync(path.resolve(process.cwd(), "./server/data/prompts.json"), "utf8");
		const whiteCardsFile = fs.readFileSync(path.resolve(process.cwd(), "./server/data/responses.json"), "utf8");
		this.blackCards = JSON.parse(blackCardsFile);
		this.whiteCards = JSON.parse(whiteCardsFile);
	}

	private static getAllowedCard(cards: ICard[], usedCards: number[])
	{
		const allowedCards = cards.filter(a => usedCards.indexOf(a.id) === -1);
		const allowedIds = allowedCards.map(c => c.id);
		const index = Math.floor(Math.random() * allowedIds.length);
		const newCardId = allowedIds[index];
		const newCard = allowedCards.find(c => c.id === newCardId);

		if(!newCard)
		{
			throw new Error("Unable to get valid card");
		}

		return newCard;
	}

	public static nextBlackCard(gameItem: GameItem)
	{
		const newCard = this.getAllowedCard(this.blackCards, gameItem.usedBlackCards);

		const newGame = {...gameItem};
		newGame.blackCard = newCard.id;
		newGame.usedBlackCards.push(newCard.id);

		return newGame;
	}

	public static async dealWhiteCards(gameItem: GameItem)
	{
		let usedWhiteCards = [...gameItem.usedWhiteCards];

		const newHands = Object.keys(gameItem.players)
			.reduce((hands, playerGuid) =>
			{
				hands[playerGuid] = gameItem.players[playerGuid].whiteCards;

				while (hands[playerGuid].length < 7)
				{
					const newCard = this.getAllowedCard(this.whiteCards, usedWhiteCards);
					usedWhiteCards.push(newCard.id);

					hands[playerGuid].push(newCard.id);
				}

				return hands;
			}, {} as { [key: string]: number[] });

		const newGame = {...gameItem};
		newGame.usedWhiteCards = usedWhiteCards;

		await GameManager.updateGame(newGame);

		return newHands;
	}

	public static getWhiteCard(cardId: number)
	{
		return this.whiteCards[cardId];
	}

	public static getBlackCard(cardId: number)
	{
		return this.blackCards[cardId];
	}
}