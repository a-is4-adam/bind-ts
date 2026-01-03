import { useElementContext } from "./bind-context";

function Tab({ children }: { children: React.ReactNode }) {
	const element = useElementContext();
	return <button onClick={element.handleChange}>{children}</button>;
}
function TabPanel({ children }: { children: React.ReactNode }) {
	const element = useElementContext();
	if (!element.isActive) return null;
	return <div>{children}</div>;
}

export { Tab, TabPanel };
