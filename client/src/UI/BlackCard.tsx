import * as React from "react";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

interface IBlackCardProps
{
}

interface DefaultProps
{
}

type Props = IBlackCardProps & DefaultProps;
type State = IBlackCardState;

interface IBlackCardState
{
	elevation: number;
}

export class BlackCard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			elevation: 2
		};
	}

	private onMouseEnter = () =>
	{
		this.setState({
			elevation: 10
		});
	};

	private onMouseLeave = () =>
	{
		this.setState({
			elevation: 2
		});
	};

	public render()
	{
		return (
			<Card
				style={{
					height: "33vh",
					minHeight: "20rem",
					backgroundColor: "black",
				}}
				elevation={this.state.elevation}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<CardContent>
					<Typography variant={"h4"} style={{color: "white"}}>
						{this.props.children}
					</Typography>
				</CardContent>
			</Card>
		);
	}
}