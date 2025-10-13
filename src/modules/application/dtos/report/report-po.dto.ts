export interface IReportPo {
  id: number;
  po_number?: string;
  order_date?: string;
  expired_date?: string;
  purposes?: string;
  created_at: string;
  update_at: string;
  sub_total?: number;
  vat?: number;
  total?: number;
  step: boolean;
  document: {
    document_number: string | null;
    department:{
        code?:string
        name?:string
    }
    document_type:{
        name?:string
        code?:string
    }
    requester:{
        username?:string
        email?:string
        tel?:string
    }
  }
}


export interface IReportMoneyPo {
  status: string;
  total: number;
}
