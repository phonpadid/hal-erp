import type{ VNode } from "vue";
export interface ItemType {
  key?: string;
  label?: string;
  icon?: string | (() => VNode | Element | string);
  children?: ItemType[];
  type?: string;
  role?: string[];
}
