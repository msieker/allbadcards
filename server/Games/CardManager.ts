import {GameItem, GameManager} from "./GameManager";
import fs from "fs";
import * as path from "path";
import levenshtein from "js-levenshtein";

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
		const ogBlackCards = (JSON.parse(blackCardsFile) as IBlackCard[]);
		const ogWhiteCards = JSON.parse(whiteCardsFile) as IWhiteCard[];

		/**
		 * Remove all the duplicate cards, based on a graduated levenshtein distance.
		 * Cards with < 7 characters will be checked for an exact, case insensitive match.
		 * Cards with > 7 characters will be checked for a levenshtein distance of ~15% of the string length.
		 *      e.g. String with length 7 will fail when matched with levenshtein distance of 1. String of length 14 will fail with LD of 2, etc.
		 * @param {T[]} acc
		 * @param {T} card
		 * @param {(card: T) => string} getCardProperty
		 * @returns {T | undefined}
		 */
		const doMatch = <T extends ICard>(acc: T[], card: T, getCardProperty: (card: T) => string) => {
			return acc.find(c => {
				const cVal = getCardProperty(c);
				const cardVal = getCardProperty(card);
				const isExact = cVal.toLowerCase() === cardVal.toLowerCase();
				const levElligible = cVal.length > 7;
				const levDist = Math.floor(cVal.length / 7);
				const isLevMatch = levElligible && levenshtein(cVal, cardVal) < levDist;
				return isExact || isLevMatch;
			});
		};

		this.blackCards = ogBlackCards.reduce((acc, card) =>
		{
			const matchFound = doMatch(acc, card, (card) => card.prompt);

			if (!matchFound)
			{
				acc.push(card);
			}

			return acc;
		}, [] as IBlackCard[]);

		console.log(`Removed ${ogBlackCards.length - this.blackCards.length} duplicate black cards`);


		this.whiteCards = ogWhiteCards.reduce((acc, card) =>
		{
			const matchFound = doMatch(acc, card, (card) => card.response);

			if (!matchFound)
			{
				acc.push(card);
			}

			return acc;
		}, [] as IWhiteCard[]);

		console.log(`Removed ${ogWhiteCards.length - this.whiteCards.length} duplicate white cards`);
	}

	private static getAllowedCard(cards: ICard[], usedCards: number[])
	{
		const allowedCards = cards.filter(a => usedCards.indexOf(a.id) === -1);
		const allowedIds = allowedCards.map(c => c.id);
		const index = Math.floor(Math.random() * allowedIds.length);
		const newCardId = allowedIds[index];
		const newCard = allowedCards.find(c => c.id === newCardId);

		if (!newCard)
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
		const newGame = {...gameItem};

		let usedWhiteCards = [...gameItem.usedWhiteCards];

		const playerKeys = Object.keys(gameItem.players);

		const availableCardRemainingCount = this.whiteCards.length - usedWhiteCards.length;

		// If we run out of white cards, reset them
		if (availableCardRemainingCount < playerKeys.length)
		{
			usedWhiteCards = [];
		}

		const foundBlackCard = this.blackCards.find(c => c.id === gameItem.blackCard);

		const targetHandSize = foundBlackCard?.special === "DRAW 2, PICK 3"
			? 9
			: 7;

		const newHands = playerKeys
			.reduce((hands, playerGuid) =>
			{
				hands[playerGuid] = gameItem.players[playerGuid].whiteCards;

				while (hands[playerGuid].length < targetHandSize)
				{
					const newCard = this.getAllowedCard(this.whiteCards, usedWhiteCards);
					usedWhiteCards.push(newCard.id);

					hands[playerGuid].push(newCard.id);
				}

				return hands;
			}, {} as { [key: string]: number[] });

		newGame.usedWhiteCards = usedWhiteCards;

		await GameManager.updateGame(newGame);

		return newHands;
	}

	public static getWhiteCard(cardId: number)
	{
		return this.whiteCards.find(c => c.id === cardId);
	}

	public static getBlackCard(cardId: number)
	{
		return this.blackCards.find(c => c.id === cardId);
	}
}