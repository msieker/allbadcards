import {CopyToClipboard} from "react-copy-to-clipboard";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import {GameDataStore} from "../Global/DataStore/GameDataStore";

export interface ICopyGameLinkProps
{
	className?: string;
	buttonSize?: "small" | "medium" | "large";
}

export const CopyGameLink: React.FC<ICopyGameLinkProps> = (props) =>
{
	const [copied, setCopied] = useState(false);

	const [gameData, setGameData] = useState(GameDataStore.state);

	useEffect(() =>
	{
		GameDataStore.listen(setGameData);
	}, []);

	const onCopy = () =>
	{
		setCopied(true);

		setTimeout(() => setCopied(false), 3000);
	};

	if(!gameData.game)
	{
		return null;
	}

	const shareLabel = copied ? "Copied!" : "Copy Game Link";

	return (
		<CopyToClipboard text={`${location.protocol}//${location.host}/game/${gameData.game?.id}`} onCopy={onCopy}>
			<Button color={"primary"} variant={"contained"} size={props.buttonSize ?? "medium"} className={props.className}>
				{shareLabel}
			</Button>
		</CopyToClipboard>
	);
};