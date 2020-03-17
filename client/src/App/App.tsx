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

	return (
		<div>
			<div>
				<Container maxWidth={"sm"}>
					<Card className={classes.card}>
						<CardMedia>
							<AppBar position="static">
								<Toolbar>
									<Typography variant="h6">
										humanity.cards
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