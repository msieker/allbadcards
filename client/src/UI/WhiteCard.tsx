import * as React from "react";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

interface IWhiteCardProps
{
	onSelect?: () => void;
}

interface DefaultProps
{
}

type Props = IWhiteCardProps & DefaultProps;
type State = IWhiteCardState;

interface IWhiteCardState
{
	elevation: number;
}

export class WhiteCard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			elevation: 2
		};
	}

	private onMouseEnter = () => {
		this.setState({
			elevation: 10
		});
	};

	private onMouseLeave = () => {
		this.setState({
			elevation: 2
		});
	};

	public render()
	{
		const {
			onSelect,
			children,
 		} = this.props;

		return (
			<Card
				style={{minHeight: "33vh", cursor: "pointer"}}
				elevation={this.state.elevation}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				onClick={onSelect}
			>
				<CardContent>
					<Typography variant={"h5"}>
						{children}
					</Typography>
				</CardContent>
			</Card>
		);
	}
}