import { List, Action, ActionPanel, } from "@raycast/api";
import essays from "./essays";


// Main command component
export default function Command() {
  return (
    <List>
      {essays.map((essay, index) => (
        <List.Item
          key={index}
          title={essay.title}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={essay.url} title={`Open in Browser`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

