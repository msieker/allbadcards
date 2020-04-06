import React, {useEffect, useState} from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import GamePreview from "./GamePreview";
import {Platform} from "../../Global/Platform/platform";
import {UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import {NicknameDialog} from "../../UI/NicknameDialog";

interface IGameJoinProps
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

const GameJoin: React.FC<IGameJoinProps> = (props) =>
{
	const [userData, setUserData] = useState(UserDataStore.state);
	const [gameData, setGameData] = useState(GameDataStore.state);
	const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);

	useEffect(() =>
	{
		UserDataStore.listen(setUserData);
		GameDataStore.listen(setGameData);
	});

	const onJoinClick = () =>
	{
		setNicknameDialogOpen(true);
	};

	const onNicknameClose = () =>
	{
		setNicknameDialogOpen(false);
	};

	const onConfirm = (nickname: string) =>
	{
		Platform.joinGame(userData.playerGuid, props.id, nickname, false)
			.catch(e => alert(e));
	};

	const joined = userData.playerGuid in (gameData.game?.players ?? {});

	return (
		<GamePreview id={props.id}>
			{!joined && (
				<>
					<Button variant={"contained"} color={"primary"} onClick={onJoinClick}>
						Join
					</Button>

					<NicknameDialog
						open={nicknameDialogOpen}
						onClose={onNicknameClose}
						onConfirm={onConfirm}
						title={"Please enter your nickname:"}
					/>
				</>
			)}

			{joined && (
				<Typography>Waiting for game to start...</Typography>
			)}
		</GamePreview>
	);
};

export default GameJoin;