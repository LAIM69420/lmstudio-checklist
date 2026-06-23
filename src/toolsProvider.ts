import { tool, type ToolsProvider } from "@lmstudio/sdk";
import { z } from "zod";

import { buildConfigSchematics } from "./configSchematics.js";
import { setDataPath, createChecklist, addItem, toggleItem, removeItem, listChecklists, deleteChecklist } from "./checklistStore.js";

const configSchematics = buildConfigSchematics();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatChecklist(cl: { id: string; title: string; items: { text: string; done: boolean }[] }, index?: number): string {
  const total = cl.items.length;
  const done = cl.items.filter((i) => i.done).length;
  const prefix = index !== undefined ? `${index}. ` : "";
  const lines: string[] = [];
  lines.push(`${prefix}[#${cl.id}] ${cl.title} (${done}/${total})`);
  for (let i = 0; i < cl.items.length; i++) {
    const mark = cl.items[i].done ? "✅" : "☐";
    lines.push(`  ${mark} ${i}. ${cl.items[i].text}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Tools provider
// ---------------------------------------------------------------------------

export const toolsProvider: ToolsProvider = async (ctl) => {
  const config = ctl.getPluginConfig(configSchematics);
  const dataFile: string = config.get("dataFile");
  setDataPath(dataFile);

  const newTool = tool({
    name: "checklist_new",
    description: "Create a new checklist with a title.",
    parameters: {
      title: z.string().min(1).max(200).describe("Title of the checklist"),
    },
    async implementation({ title }) {
      const cl = await createChecklist(title);
      return `Created checklist #${cl.id}: "${cl.title}". Use 'checklist_add' to add items.`;
    },
  });

  const addTool = tool({
    name: "checklist_add",
    description: "Add an item to an existing checklist.",
    parameters: {
      listId: z.string().min(1).describe("Checklist ID"),
      text: z.string().min(1).max(500).describe("Item text"),
    },
    async implementation({ listId, text }) {
      const ok = await addItem(listId, text);
      return ok ? `Added item to checklist #${listId}.` : `Checklist #${listId} not found.`;
    },
  });

  const doneTool = tool({
    name: "checklist_done",
    description: "Mark an item as done or undo it (toggle).",
    parameters: {
      listId: z.string().min(1).describe("Checklist ID"),
      itemIndex: z.number().int().min(0).describe("Index of the item to toggle"),
    },
    async implementation({ listId, itemIndex }) {
      const err = await toggleItem(listId, itemIndex);
      return err ?? `Toggled item ${itemIndex} in checklist #${listId}.`;
    },
  });

  const removeTool = tool({
    name: "checklist_remove_item",
    description: "Remove an item from a checklist.",
    parameters: {
      listId: z.string().min(1).describe("Checklist ID"),
      itemIndex: z.number().int().min(0).describe("Index of the item to remove"),
    },
    async implementation({ listId, itemIndex }) {
      const err = await removeItem(listId, itemIndex);
      return err ?? `Removed item ${itemIndex} from checklist #${listId}.`;
    },
  });

  const showTool = tool({
    name: "checklist_show",
    description: "Show all checklists or a specific one.",
    parameters: {
      listId: z.string().optional().describe("Optional checklist ID to show details for"),
    },
    async implementation({ listId }) {
      const lists = await listChecklists();
      if (lists.length === 0) return "No checklists yet. Create one with 'checklist_new'.";

      if (listId) {
        const cl = lists.find((l) => l.id === listId);
        return cl ? formatChecklist(cl) : `Checklist #${listId} not found.`;
      }

      return lists
        .map((cl, i) => formatChecklist(cl, i + 1))
        .join("\n\n");
    },
  });

  const deleteTool = tool({
    name: "checklist_delete",
    description: "Delete an entire checklist.",
    parameters: {
      listId: z.string().min(1).describe("Checklist ID to delete"),
    },
    async implementation({ listId }) {
      const ok = await deleteChecklist(listId);
      return ok ? `Deleted checklist #${listId}.` : `Checklist #${listId} not found.`;
    },
  });

  return [newTool, addTool, doneTool, removeTool, showTool, deleteTool];
};
