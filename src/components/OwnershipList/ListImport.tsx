import React from 'react';
import { Props as ListProps } from "./List";
import "./ListImport.scss";

type Props = {
	setOwnershipList: Function;
};

export default function ListImport(props: Props) {
	const [imported, setImported] = React.useState<number>(0);
	const [lists, setLists] = React.useState<ListProps[]>([]);
	const [nextToken, setNextToken] = React.useState<string | null | undefined>(undefined);
	const [state, setState] = React.useState<string>("");

	const handleAbort = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		props.setOwnershipList({ lists, nextToken });
	};

	React.useEffect(() => {
		if (nextToken === null) {
			props.setOwnershipList({ lists, nextToken });
			return;
		}

		let endpoint = "lists";
		if (nextToken !== undefined)
			endpoint += `?next=${nextToken}`;

		GET(endpoint)
			.then(json => {
				const { data, meta: { result_count, next_token } } = json;
				if (result_count > 0) {
					setLists(lists.concat(data));
					setImported(imported + result_count);
				}
				setNextToken(next_token === undefined ? null : next_token);
			})
			.catch(e => {
				console.error(e);
				if (e instanceof Error)
					setState(e.message);
			});
	}, [imported]);

	return (
		<div className="list-import">
			<div className={"list-import-base" + (imported > 0 ? " list-import-open" : "")}>
				<div className="list-import-message">Importing...[{imported}</div>
				<div className="list-import-message">{state}</div>
				<div className="button-group">
					<button onClick={handleAbort}>Abort</button>
				</div>
			</div>
		</div>
	);
}