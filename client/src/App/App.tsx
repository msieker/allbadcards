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

const App: React.FC = () =>
{
	const classes = useStyles();

	useEffect(() => {
		UserDataStore.initialize();
	}, []);

	return (
		<div>
			<div>
				<Container maxWidth={"sm"}>
					<Card className={classes.card}>
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
							<Routes />
						</CardContent>
					</Card>
				</Container>
			</div>
		</div>
	);
};

export default App;