import GameStart from "./GameStart";
import {RouteComponentProps, withRouter} from "react-router";
import React from "react";

interface IGameParams
{
	id: string;
}

class Game extends React.Component<RouteComponentProps<IGameParams>>
{
	public render()
	{
		return (
			<GameStart id={this.props.match.params.id}/>
		);
	}
};

export default withRouter(Game);