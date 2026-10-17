export type { Page } from "../../types/index";

export type GroupCat    = { id: number; name: string; slug: string; color: string; cats: number; products: number; active: boolean };
export type Cat         = { id: number; name: string; slug: string; group: string; emoji: string; products: number; active: boolean };
export type SubCat      = { id: number; name: string; slug: string; parent: string; products: number; sort: number; active: boolean };
export type Product     = { id: number; name: string; sku: string; cat: string; subcat: string; emoji: string; mrp: number; price: number; stock: number; status: "active"|"inactive"|"out_of_stock"|"low_stock"; featured: boolean };
export type ProdRequest = { id: number; product: string; vendor: string; vendorInit: string; cat: string; price: number; date: string; status: "pending"|"approved"|"rejected"; note: string };
export type TaxRule     = { id: number; name: string; slab: number; type: "GST"|"IGST"|"Customs"; category: string; products: number; active: boolean };
export type Brand       = { id: number; name: string; slug: string; category: string; logoColor: string; logoInit: string; logoUrl?: string; products: number; country: string; countryFlag: string; website: string; featured: boolean; active: boolean; premium: boolean };
export type BrandRequest = { id: number; brandName: string; owner: string; ownerInit: string; category: string; website: string; country: string; date: string; status: "pending"|"approved"|"rejected"; note: string };
