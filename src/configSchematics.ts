import { createConfigSchematics } from "@lmstudio/sdk";

export function buildConfigSchematics() {
  return createConfigSchematics()
    .field("dataFile", "string", {}, "./.lmstudio-checklist.json")
    .build();
}
