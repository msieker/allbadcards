import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
	container: {
		position: "fixed",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		bottom: 0,
		left: 0,
		width: "100%",
	},
	inner: {
		boxSizing:"border-box",
		display: "flex",
		maxWidth: 600,
		width: "100%",
		background: "black",
		justifyContent: "center",
		padding: "1rem",
		boxShadow: "0 -5px 15px -10px rgba(0,0,0,0.5)"
	}
});

export const Confirmation: React.FC = (props) =>
{
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.inner}>
				{props.children}
			</div>
		</div>
	);
}