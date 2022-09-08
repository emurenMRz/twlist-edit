import React from 'react';

type Props = {
	onSearch: Function;
}

export default function Input(props: Props) {
	const inputBox = React.createRef<HTMLInputElement>();

	return (
		<div className="input">
			<input ref={inputBox} className="box" type="text" placeholder="user-name or user-id" onKeyDown={function (e: React.KeyboardEvent<HTMLInputElement>) {
				if (e.key === "Enter")
					props.onSearch((e.target as HTMLInputElement).value);
			}} />
			<button onClick={() => props.onSearch(inputBox?.current?.value)}>search</button>
		</div>
	);
}
