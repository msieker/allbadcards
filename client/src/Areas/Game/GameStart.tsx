import React, {useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import GamePreview from "./GamePreview";
import {Platform} from "../../Global/Platform/platform";
import {UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";

interface IGameStartProps
{
	id: string;
}

const useStyles = makeStyles({
	playersLabel: {
		marginTop: "2rem"
	},
	gameId: {
		padding: "1rem 0"
	}
});

const GameStart: React.FC<IGameStartProps> = (props) =>
{
	const [gameData, setGameData] = useState(GameDataStore.state);

	useEffect(() =>
	{
		GameDataStore.listen(setGameData);
	}, []);

	const onClickStart = () => {
		Platform.startGame(UserDataStore.state.playerGuid, props.id)
			.catch(e => console.error(e));
	};

	const players = Object.keys(gameData.game?.players ?? {});
	const canStart = players.length > 1;

	return (
		<GamePreview id={props.id}>
			<Button variant={"contained"} color={"primary"} onClick={onClickStart} disabled={!canStart}>
				Start
			</Button>
		</GamePreview>
	);
};

export default GameStart;