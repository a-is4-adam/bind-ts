import { useSlotContext } from "./compound-context";

function Tab({ children }: { children: React.ReactNode }) {
  const slot = useSlotContext();
  return <button onClick={slot.setVariant}>{children}</button>;
}
function TabPanel({ children }: { children: React.ReactNode }) {
  const slot = useSlotContext();
  if (!slot.isActive) return null;
  return <div>{children}</div>;
}

export { Tab, TabPanel };
