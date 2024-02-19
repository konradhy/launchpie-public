/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.9.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as companies from "../companies.js";
import type * as equityPie from "../equityPie.js";
import type * as files from "../files.js";
import type * as helpers_utils from "../helpers/utils.js";
import type * as helpers from "../helpers.js";
import type * as ingest_embed from "../ingest/embed.js";
import type * as ingest_extract from "../ingest/extract.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as persons from "../persons.js";
import type * as serve from "../serve.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  companies: typeof companies;
  equityPie: typeof equityPie;
  files: typeof files;
  "helpers/utils": typeof helpers_utils;
  helpers: typeof helpers;
  "ingest/embed": typeof ingest_embed;
  "ingest/extract": typeof ingest_extract;
  messages: typeof messages;
  notes: typeof notes;
  persons: typeof persons;
  serve: typeof serve;
  tasks: typeof tasks;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
