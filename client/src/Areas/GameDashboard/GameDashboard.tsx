import * as React from "react";
import {List} from "@material-ui/core";
import {GiCardDraw, GiCardPlay} from "react-icons/all";
import Button from "@material-ui/core/Button";
import shortid from "shortid";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";

interface IGameDashboardProps extends RouteComponentProps
{
}

interface DefaultProps
{
}

type Props = IGameDashboardProps & DefaultProps;
type State = ICreationState;

interface ICreationState
{
}

class GameDashboard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {};
	}

	private createGame = () =>
	{
		this.props.history.push(`/game/${shortid.generate()}`)
	};

	public render()
	{
		return (
			<>
				<List>

				</List>

				<ButtonGroup style={{width: "100%"}}>
					<Button
						variant="contained"
						color="primary"
						size="large"
						onClick={this.createGame}
						startIcon={<GiCardDraw/>}
					>
						New Game
					</Button>
					<Button
						variant="contained"
						color="primary"
						size="large"
						onClick={this.createGame}
						startIcon={<GiCardPlay/>}
					>
						Join Game
					</Button>
				</ButtonGroup>
			</>
		);
	}
}

export default withRouter(GameDashboard);