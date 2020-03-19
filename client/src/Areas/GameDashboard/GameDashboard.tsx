import * as React from "react";
import {List} from "@material-ui/core";
import {GiCardDraw, GiCardPlay} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {Platform} from "../../Global/Platform/platform";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";

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
	userData: IUserData;
}

class GameDashboard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			userData: UserDataStore.state
		};
	}

	public componentDidMount(): void
	{
		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private createGame = async () =>
	{
		const game = await Platform.createGame(this.state.userData.playerGuid);
		this.props.history.push(`/game/start/${game.id}`)
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
				</ButtonGroup>
			</>
		);
	}
}

export default withRouter(GameDashboard);