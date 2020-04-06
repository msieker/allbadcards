import React, {useEffect, useState} from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import {GameRoster} from "./Components/GameRoster";
import {CopyGameLink} from "../../UI/CopyGameLink";

interface IGamePreviewProps
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

const GamePreview: React.FC<IGamePreviewProps> = (props) =>
{
	const classes = useStyles();

	useEffect(() =>
	{
		GameDataStore.hydrate(props.id);
	}, []);

	return (
		<div>
			<Typography>Game ID: </Typography>
			<Typography variant={"h4"} className={classes.gameId}>{props.id}</Typography>

			<CopyGameLink />
			<Typography className={classes.playersLabel}>Players</Typography>
			<GameRoster />
			{props.children}
		</div>
	);
};

export default GamePreview;