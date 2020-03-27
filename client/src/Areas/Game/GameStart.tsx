import React from "react";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import GamePreview from "./GamePreview";
import {Platform} from "../../Global/Platform/platform";
import {UserDataStore} from "../../Global/DataStore/UserDataStore";

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
	const onClickStart = () => {
		Platform.startGame(UserDataStore.state.playerGuid, props.id)
			.catch(e => console.error(e));
	};

	return (
		<GamePreview id={props.id}>
			<Button variant={"contained"} color={"primary"} onClick={onClickStart}>
				Start
			</Button>
		</GamePreview>
	);
};

export default GameStart;