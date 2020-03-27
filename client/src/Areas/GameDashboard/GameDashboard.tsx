import * as React from "react";
import {List} from "@material-ui/core";
import {GiCardDraw, GiCardPlay} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {GameItem, Platform} from "../../Global/Platform/platform";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {NicknameDialog} from "../../UI/NicknameDialog";

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
	nicknameDialogOpen: boolean;
}

export const gamesOwnedLsKey = "games-owned";

class GameDashboard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			userData: UserDataStore.state,
			nicknameDialogOpen: false
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
		this.setState({
			nicknameDialogOpen: true
		});
	};

	private onNicknameClose = () => {
		this.setState({
			nicknameDialogOpen: false
		});
	};

	private onNicknameConfirm = async (nickname: string) => {
		const game = await Platform.createGame(this.state.userData.playerGuid, nickname);
		this.storeOwnedGames(game);
		this.props.history.push(`/game/${game.id}`)
	};

	private storeOwnedGames(game: GameItem)
	{
		const gamesOwnedString = localStorage.getItem(gamesOwnedLsKey) ?? "[]";
		const gamesOwned = JSON.parse(gamesOwnedString) as string[];
		gamesOwned.push(game.id);
		localStorage.setItem(gamesOwnedLsKey, JSON.stringify(gamesOwned));
	}

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
				<NicknameDialog
					open={this.state.nicknameDialogOpen}
					onClose={this.onNicknameClose}
					onConfirm={this.onNicknameConfirm}
					title={"Please enter your nickname:"}
				/>
			</>
		);
	}
}

export default withRouter(GameDashboard);