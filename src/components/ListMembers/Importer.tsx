import React from 'react';
import { Props as MemberProps } from './Member';
import Portal from '../Portal';
import "./Importer.scss";

type Props = {
	listId: string;
	importMembers: MemberProps[];
	onAbort: Function;
};

export default function Importer(props: Props) {
	const [imported, setImported] = React.useState<number>(0);
	const [state, setState] = React.useState<string>("");
	const [buttonText, setButtonText] = React.useState<string>("Abort");

	const handleAbort = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setImported(0);
		props.onAbort();
	};

	React.useEffect(() => {
		if (props.importMembers.length === 0) return;
		if (imported >= props.importMembers.length) {
			setState("Complete");
			setButtonText("Close");
			return;
		}

		const user = props.importMembers[imported];
		POST(`list/${props.listId}`, { user_id: user.id })
			.then(json => {
				if (!json.data.is_member)
					setState(`Failed add member: ${user.id}`);
				setImported(imported + 1);
			})
			.catch(e => {
				console.error(e);
				if (e instanceof Error)
					setState(e.message);
			});
	}, [props, props.importMembers, imported]);

	return (
		<Portal targetID="confirm">
			<div className={"importer" + (props.importMembers.length > 0 ? " importer-open" : "")}>
				<div className="importer-base">
					<div className="importer-message">Importing...[{imported}/{props.importMembers.length}]</div>
					<div className="importer-message">{state}</div>
					<div className="button-group">
						<button onClick={handleAbort}>{buttonText}</button>
					</div>
				</div>
			</div>
		</Portal>
	);
}