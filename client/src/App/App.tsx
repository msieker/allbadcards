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
import {MdPeople, MdShare} from "react-icons/all";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link, matchPath, RouteComponentProps} from "react-router-dom";
import {ErrorDataStore} from "../Global/DataStore/ErrorDataStore";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {CopyGameLink} from "../UI/CopyGameLink";
import {GameDataStore} from "../Global/DataStore/GameDataStore";
import {useHistory} from "react-router";
import {SiteRoutes} from "../Global/Routes/Routes";
import ReactGA from "react-ga";
import classNames from "classnames";
import Helmet from "react-helmet";

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
		width: "auto",
		paddingRight: "1rem"
	},
	settingsButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
	firstButton: {
		minWidth: 0,
		marginLeft: "auto",
		fontSize: "1.5rem"
	},
	rosterButton: {
		minWidth: 0,
		fontSize: "1.5rem"
	},
	logo: {
		color: "#000",
		textDecoration: "none",
		display: "flex",
		alignItems: "center"
	},
	appBar: {
		padding: "0 1rem"
	},
	centerBar: {
		display: "flex",
		justifyContent: "center"
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
	const [shareOpen, setShareOpen] = useState(false);

	const history = useHistory();

	const isGame = !!matchPath(history.location.pathname, SiteRoutes.Game.path);
	const isHome = history.location.pathname === "/";

	const appBarClasses = classNames(classes.appBar, {
		[classes.centerBar]: isHome
	});

	useEffect(() =>
	{
		UserDataStore.initialize();
		history.listen(() =>
		{
			ReactGA.pageview(window.location.pathname + window.location.search);
		});
	}, []);

	return (
		<div>
			<Helmet titleTemplate={"%s | All Bad Cards"} defaultTitle={"All Bad Cards | Play Cards Against Humanity online!"}/>
			<OuterContainer>
				<Paper elevation={10}>
					<Container maxWidth={"md"} style={{position: "relative", padding: 0, background: "#FFF", minHeight: "100vh"}}>
						<CardMedia>
							<AppBar color={"transparent"} position="static" elevation={0}>
								<Toolbar className={appBarClasses}>
									<Typography variant="h6">
										<Link to={"/"} className={classes.logo}>
											<img className={classes.logoIcon} src={"/logo-small.png"}/> All Bad Cards
										</Link>
									</Typography>
									{isGame && (
										<>
											<Button className={classes.firstButton} size={"large"} onClick={() => setShareOpen(true)}>
												<MdShare/>
											</Button>
											<Button className={classes.rosterButton} size={"large"} onClick={() => setRosterOpen(true)}>
												<MdPeople/>
											</Button>
										</>
									)}
								</Toolbar>
							</AppBar>
						</CardMedia>
						<CardContent>
							<Paper style={{padding: "1rem", marginBottom: "1rem"}}>
								<Typography>
									FYI everyone - the server is having trouble keeping up with demand. I've increased server capacity and I'm working to improve performance!
								</Typography>
							</Paper>
							<Routes/>
						</CardContent>
					</Container>
				</Paper>
			</OuterContainer>
			<Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
				<DialogContent style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography variant={"h4"}>Game: {GameDataStore.state.game?.id}</Typography>
					<br/>
					<br/>
					<CopyGameLink buttonSize={"large"}/>
				</DialogContent>
			</Dialog>
			<Dialog open={rosterOpen} onClose={() => setRosterOpen(false)}>
				<DialogTitle id="form-dialog-title">Game Roster</DialogTitle>
				<DialogContent>
					<GameRoster/>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default App;