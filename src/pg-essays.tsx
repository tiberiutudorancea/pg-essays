import { List, Detail, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useState, useEffect } from "react";
import axios from 'axios';
import * as cheerio from 'cheerio';

// Fetch essay function
async function fetchEssay(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const essayText = $('table table font').text();
    
    return essayText;
  } catch (error) {
    console.error('Error fetching essay:', error);
    return 'Failed to fetch essay';
  }
}

// List of essays
const essays = [
  { title: "Founder Mode", url: "https://www.paulgraham.com/foundermode.html" },
  { title: "How to Do Great Work", url: "https://www.paulgraham.com/greatwork.html" },
  { title: "What I Worked On", url: "https://www.paulgraham.com/worked.html" },
  // Add more essays here
];

// Main command component
export default function Command() {
  const [selectedEssay, setSelectedEssay] = useState<string | null>(null);
  const [essayContent, setEssayContent] = useState<string>("");

  useEffect(() => {
    if (selectedEssay) {
      fetchEssay(selectedEssay).then(setEssayContent);
    }
  }, [selectedEssay]);

  if (selectedEssay) {
    return (
      <Detail
        markdown={essayContent}
        actions={
          <ActionPanel>
            <Action title="Go Back" onAction={() => setSelectedEssay(null)} />
            <Action.OpenInBrowser url={selectedEssay} />
          </ActionPanel>
        }
      />
    );
  }

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
