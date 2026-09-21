"use client";

import { useSyncExternalStore } from "react";
import {
  getProjectsServerSnapshot,
  getProjectsSnapshot,
  subscribeToProjects,
  type ProjectSummary,
} from "./storage";

/**
 * The saved-projects list, read straight from localStorage.
 *
 * `useSyncExternalStore` rather than copying into state inside an effect: the
 * browser's storage is the source of truth, and this keeps every projects list
 * in the app — and in other open tabs — in step with it.
 */
export function useProjects(): ProjectSummary[] {
  return useSyncExternalStore(subscribeToProjects, getProjectsSnapshot, getProjectsServerSnapshot);
}
