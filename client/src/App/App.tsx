import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, DialogTitle} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CardMedia from '@material-ui/core/CardMedia';
import Container from "@material-ui/core/Container";
import {makeStyles} from "@material-ui/styles";
import CardContent from "@material-ui/core/CardContent";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import styled from "@material-ui/styles/styled";
import Paper from "@material-ui/core/Paper";
import {MdPeople} from "react-icons/all";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link} from "react-router-dom";
import {ErrorDataStore} from "../Global/DataStore/ErrorDataStore";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

interface IAppProps
{
}

interface DefaultProps
{
}

type Props = IAppProps & DefaultProps;
type State = IAppState;

interface IAppState
{
}

const useStyles = makeStyles({
	logoIcon: {
		height: "2rem",
		width: "auto"
	},
	settingsButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
	rosterButton: {
		minWidth: 0,
		fontSize: "1.5rem",
		marginLeft: "auto"
	},
	logo: {
		color: "#000",
		textDecoration: "none",
		display: "flex",
		alignItems: "center"
	}
});

const OuterContainer = styled(Container)({
	background: "#EEE",
	minHeight: "100vh",
	width: "100%",
	padding: 0,
	maxWidth: "none"
});

const App: React.FC = () =>
{
	const classes = useStyles();

	const [rosterOpen, setRosterOpen] = useState(false);
	const [errorPayload, setErrors] = useState(ErrorDataStore.state);

	useEffect(() =>
	{
		UserDataStore.initialize();
		ErrorDataStore.listen(setErrors);
	}, []);

	return (
		<div>
			<OuterContainer>
				<Paper elevation={10}>
					<Container maxWidth={"sm"} style={{position: "relative", padding: 0, background: "#FFF", minHeight: "100vh"}}>
						<CardMedia>
							<AppBar color={"transparent"} position="static" elevation={0}>
								<Toolbar>
									<Typography variant="h6">
										<Link to={"/"} className={classes.logo}>
											<img className={classes.logoIcon} src={"/logo-small.png"} style={{paddingRight: "1rem"}}/> Let's Play WTF
										</Link>
									</Typography>
									<Button className={classes.rosterButton} size={"large"} onClick={() => setRosterOpen(true)}>
										<MdPeople/>
									</Button>
								</Toolbar>
							</AppBar>
						</CardMedia>
						<CardContent>
							<Routes/>
						</CardContent>
					</Container>
				</Paper>
			</OuterContainer>
			<Dialog open={rosterOpen} onClose={() => setRosterOpen(false)}>
				<DialogTitle id="form-dialog-title">Game Roster</DialogTitle>
				<DialogContent>
					<GameRoster/>
				</DialogContent>
			</Dialog>
			<Dialog open={errorPayload.errors.length > 0} onClose={ErrorDataStore.clear}>
				<DialogTitle id="form-dialog-title">Errors</DialogTitle>
				<DialogContent>
					<List>
						{errorPayload.errors.map(error => (
							<ListItem>
								<ListItemText>
									<pre>
										{error.stack}
									</pre>
								</ListItemText>
							</ListItem>
						))}
					</List>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default App;