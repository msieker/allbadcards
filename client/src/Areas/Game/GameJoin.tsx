import React from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import {GoPerson} from "react-icons/all";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Divider from "@material-ui/core/Divider";
import {makeStyles} from "@material-ui/core/styles";
import GamePreview from "./GamePreview";

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
	const classes = useStyles();

	return (
		<GamePreview id={props.id}>
			<Button variant={"contained"} color={"primary"}>
				Join
			</Button>
		</GamePreview>
	);
};

export default GameJoin;