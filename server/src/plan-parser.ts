import fs from 'fs/promises';
import path from 'path';

export interface PlanItem {
  text: string;
  checked: boolean;
}

export interface PlanSection {
  title: string;
  items: PlanItem[];
}

export interface ParsedPlan {
  sections: PlanSection[];
}

export async function readPlanFile(): Promise<string> {
  const planPath = path.join(process.cwd(), '..', 'plan.md');
  const content = await fs.readFile(planPath, 'utf-8');
  return content;
}

export function parsePlan(content: string): ParsedPlan {
  const lines = content.split('\n');
  const sections: PlanSection[] = [];
  let currentSection: PlanSection | null = null;

  for (const line of lines) {
    // Match section headers (## Title)
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: sectionMatch[1],
        items: [],
      };
      continue;
    }

    // Match checkbox items (- [x] or - [ ])
    const itemMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/);
    if (itemMatch && currentSection) {
      const checked = itemMatch[1] === 'x';
      const text = itemMatch[2];
      currentSection.items.push({text, checked});
    }
  }

  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {sections};
}
