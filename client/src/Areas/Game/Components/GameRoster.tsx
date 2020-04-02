import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {AiOutlineUserDelete} from "react-icons/all";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import React, {useEffect, useState} from "react";
import {GameDataStore} from "../../../Global/DataStore/GameDataStore";
import {ListItemSecondaryAction} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/styles";
import {UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Platform} from "../../../Global/Platform/platform";

const useStyles = makeStyles({
	iconButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
});

export const GameRoster = () =>
{
	const classes = useStyles();
	const [gameData, setGameData] = useState(GameDataStore.state);
	const [userData, setUserData] = useState(UserDataStore.state);

	useEffect(() =>
	{
		GameDataStore.listen(setGameData);
		UserDataStore.listen(setUserData);
	}, []);

	if(!gameData.game)
	{
		return null;
	}

	const gameId = gameData.game.id;

	const onClickKick = (playerGuid: string) => {
		Platform.removePlayer(gameId, playerGuid, userData.playerGuid)
			.catch(e => console.error(e));
	};

	const playerMap = gameData.game?.players ?? {};
	const players = Object.values(playerMap);

	const isOwner = gameData.game?.ownerGuid === userData.playerGuid;

	return (
		<div style={{width: "90vw", maxWidth: 500}}>
			<List>
				{players.map(player => (
					<>
						<ListItem>
							<ListItemText>
								{player.nickname}
								{player.guid === gameData.game?.ownerGuid && <>
                                    <span> (Owner)</span>
                                </>}
							</ListItemText>

							{isOwner && (
								<ListItemSecondaryAction>
									<Button size={"large"} className={classes.iconButton} onClick={() => onClickKick(player.guid)}>
										<AiOutlineUserDelete/>
									</Button>
								</ListItemSecondaryAction>
							)}
						</ListItem>
						<Divider/>
					</>
				))}
			</List>
		</div>
	);
};