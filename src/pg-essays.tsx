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
  { title: "Founder Mode" , url: "https://www.paulgraham.com/foundermode.html"},
];

// Main command component
export default function Command() {
  return (
    <List>
      {essays.map((essay) => (
        <List.Item
          key={essay.url}
          title={essay.title}
          actions={
            <ActionPanel>
              <Action.Push
                title="Read Essay"
                target={<EssayDetail url={essay.url} title={essay.title} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// Essay detail component
export function EssayDetail({ url, title }: { url: string; title: string }) {
  const [essayContent, setEssayContent] = useState<string>('Loading...');
  const [readTime, setReadTime] = useState<number>(0);
  const [publicationDate, setPublicationDate] = useState<string>('');

  useEffect(() => {
    fetchEssay(url).then(essayText => {
      const { formattedContent, readTime, publicationDate } = formatEssay(essayText, title);
      setEssayContent(formattedContent);
      setReadTime(readTime);
      setPublicationDate(publicationDate);
    });
  }, [url, title]);

  return (
    <Detail
      navigationTitle={title}
      markdown={essayContent}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Author" text="Paul Graham" />
          {publicationDate && <Detail.Metadata.Label title="Published" text={publicationDate} />}
          <Detail.Metadata.TagList title="Topics">
            <Detail.Metadata.TagList.Item text="Startups" color={Color.Orange} />
            <Detail.Metadata.TagList.Item text="Technology" color={Color.Blue} />
            <Detail.Metadata.TagList.Item text="Philosophy" color={Color.Green} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Read Time" text={`${readTime} minutes`} />
          <Detail.Metadata.Link title="Original Essay" target={url} text="Read on paulgraham.com" />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            content={essayContent}
            title="Copy Essay"
            icon={Icon.Clipboard}
          />
          <Action.OpenInBrowser url={url} title="Open in Browser" />
        </ActionPanel>
      }
    />
  );
}



function formatEssay(essayText: string, title: string): { formattedContent: string; readTime: number; publicationDate: string } {
  const paragraphs = essayText.split('\n\n');
  const readTime = Math.ceil(essayText.split(' ').length / 200);

  // Extract publication date
  const dateRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
  let publicationDate = '';
  let contentStartIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    if (dateRegex.test(paragraphs[i].trim())) {
      publicationDate = paragraphs[i].trim();
      contentStartIndex = i + 1;
      break;
    }
  }

  // Identify the start of the notes section
  let notesStartIndex = paragraphs.length;
  for (let i = contentStartIndex; i < paragraphs.length; i++) {
    if (paragraphs[i].trim().toLowerCase().startsWith('notes:') || 
        paragraphs[i].trim().toLowerCase().startsWith('note:') ||
        /^\[\d+\]/.test(paragraphs[i].trim())) { // Check for [1], [2], etc.
      notesStartIndex = i;
      break;
    }
  }

  const mainContent = paragraphs.slice(contentStartIndex, notesStartIndex).map((p, index) => {
    if (index === 0) {
      return `> ${p}`;
    }
    const cleanedParagraph = p.replace(/^\s*(\d+\.|-)\s*/, '');
    return cleanedParagraph + '  ';
  }).join('\n\n');

  const notes = paragraphs.slice(notesStartIndex).join('\n\n');

  const formattedContent = `
  ${title}

${publicationDate ? `*${publicationDate}*\n\n` : ''}
${mainContent}

${notesStartIndex < paragraphs.length ? `\n\n---\n\n### Notes\n\n${notes}` : ''}
  `;

  return { formattedContent, readTime, publicationDate };
}


  return { formattedContent, readTime };
}
