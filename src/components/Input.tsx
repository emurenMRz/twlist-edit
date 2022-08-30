import React from 'react';

export const inputBox = React.createRef<HTMLInputElement>();

type Props = {
	handleSearch: Function;
}

export default function Input(props: Props) {
	return (<div className="input">
		<input ref={inputBox} className="box" type="text" placeholder="user-id(, user-id, ...) or tweet uri" onKeyDown={function (e: React.KeyboardEvent<HTMLInputElement>) {
			if (e.key === "Enter")
				props.handleSearch((e.target as HTMLInputElement).value);
		}} />
		<button onClick={() => props.handleSearch(inputBox?.current?.value)}>search</button>
	</div>);
}
