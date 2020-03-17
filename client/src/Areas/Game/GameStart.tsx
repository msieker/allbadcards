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
	const classes = useStyles();

	return (
		<div>
			<Typography>Game ID: </Typography>
			<Typography variant={"h4"} className={classes.gameId}>{props.id}</Typography>
			<Button variant={"contained"} color={"primary"}>
				Share this game
			</Button>

			<Typography className={classes.playersLabel}>Players</Typography>
			<List>
				<ListItem>
					<ListItemIcon>
						<GoPerson/>
					</ListItemIcon>
					<ListItemText>Player</ListItemText>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemIcon>
						<GoPerson/>
					</ListItemIcon>
					<ListItemText>Player</ListItemText>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemIcon>
						<GoPerson/>
					</ListItemIcon>
					<ListItemText>Player</ListItemText>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemIcon>
						<GoPerson/>
					</ListItemIcon>
					<ListItemText>Player</ListItemText>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemIcon>
						<GoPerson/>
					</ListItemIcon>
					<ListItemText>Player</ListItemText>
				</ListItem>
				<Divider/>
			</List>
			<Button variant={"contained"} color={"primary"}>
				Start
			</Button>
		</div>
	);
};

export default GameStart;