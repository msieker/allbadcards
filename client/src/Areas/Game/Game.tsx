import GameStart from "./GameStart";
import {RouteComponentProps, withRouter} from "react-router";
import React from "react";
import GameJoin from "./GameJoin";

interface IGameParams
{
	stage: "start" | "join";
	id: string;
}

class Game extends React.Component<RouteComponentProps<IGameParams>>
{
	public render()
	{
		const {
			id,
			stage
		} = this.props.match.params;

		return (
			<>
				{stage === "join" && (
					<GameJoin id={this.props.match.params.id}/>
				)}

				{stage === "start" && (
					<GameStart id={this.props.match.params.id}/>
				)}
			</>
		);
	}
};

export default withRouter(Game);