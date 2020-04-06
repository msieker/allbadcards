import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import {Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
	callout: {
		textAlign: "center",
		marginTop: "10vh"
	},
	sponsors: {
		display: "flex",
		flexWrap: "wrap",
		marginTop: "1rem"
	},
	sponsor: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "7rem",
		boxSizing: "border-box",
		padding: "1rem",
		"& a": {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			width: "100%",
			height: "100%",
			color: "#BBB",
			textDecoration: "none",
			transition: "0.25s",
			"&:hover": {
				color: "#999"
			},
		}
	},
	noSponsor: {
		transition: "0.25s",
		"& a": {
			border: "1px dashed #BBB",
		},
		"&:hover": {
			background: "#EEE",
			borderColor: "#999"
		}
	},
	hasSponsor: {
		border: "none"
	}
});

interface ISponsor
{
	url: string;
	src: string;
}

export const SponsorList = () =>
{
	const classes = useStyles();

	const sponsors: (ISponsor | undefined)[] = [
		undefined,
		undefined,
		undefined,
	];

	return (
		<>
			<div className={classes.callout}>
				<Typography variant={"h6"}>
					Sponsors: Keeping Us Running!
				</Typography>
				<Typography variant={"body2"} style={{padding: "1rem 0", maxWidth: "30rem", margin: "auto"}}>
					This website operates with no ads or subscriptions. Donations and sponsorships keep us running.
					Follow the Patreon link below to contribute!
				</Typography>
				<div>
					<a href={"https://www.patreon.com/user?u=32889715"} target={"_blank"} rel={"noreferrer nofollow"}>
						<img src={"/become_a_patron_button.png"}/>
					</a>
				</div>
			</div>
			<Grid className={classes.sponsors}>
				{sponsors.map(s =>
					<Sponsor sponsor={s}/>
				)}
			</Grid>
		</>
	);
};

interface ISponsorProps
{
	sponsor: ISponsor | undefined;
}

const Sponsor: React.FC<ISponsorProps> = (props) =>
{
	const classes = useStyles();

	const url = props.sponsor?.url ?? "https://www.patreon.com/user?u=32889715";

	const wrapperClasses = classNames(classes.sponsor, {
		[classes.hasSponsor]: !!props.sponsor,
		[classes.noSponsor]: !props.sponsor,
	});

	return (
		<Grid item xs={12} sm={6} md={4} className={wrapperClasses}>
			<a href={url} target={"_blank"} rel={"noreferrer nofollow"}>
				{props.sponsor !== undefined && (
					<div style={{backgroundImage: props.sponsor.url}}/>
				)}

				{!props.sponsor && (
					<Typography>+ Sponsor</Typography>
				)}
			</a>
		</Grid>
	);
};