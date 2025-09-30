import type{ VNode } from "vue";
export interface ItemType {
  key?: string;
  label?: string | VNode;
  icon?: string | (() => VNode | Element | string);
  children?: ItemType[];
  permission?: string;
  type?: string;
  role?: string[];
}
