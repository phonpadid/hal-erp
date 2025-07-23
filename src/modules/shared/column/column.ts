export interface Column {
  title: string;
  dataIndex: string;
  key: string;
  align?: string;
  scopedSlots?: {
    customRender: string;
  };
}
