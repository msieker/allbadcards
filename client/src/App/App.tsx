import * as React from "react";
import {AppBar} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CardMedia from '@material-ui/core/CardMedia';
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import {makeStyles} from "@material-ui/styles";
import CardContent from "@material-ui/core/CardContent";
import {Routes} from "./Routes";
import {useEffect} from "react";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import styled from "@material-ui/styles/styled";

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
	card: {
		height: "100vh"
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

	useEffect(() =>
	{
		UserDataStore.initialize();
	}, []);

	return (
		<div>
			<OuterContainer>
				<Container maxWidth={"sm"} style={{padding: 0, background: "#FFF", minHeight: "100vh"}}>
					<CardMedia>
						<AppBar position="static">
							<Toolbar>
								<Typography variant="h6">
									Let's Play WTF
								</Typography>
							</Toolbar>
						</AppBar>
					</CardMedia>
					<CardContent>
						<Routes/>
					</CardContent>
				</Container>
			</OuterContainer>
		</div>
	);
};

export default App;