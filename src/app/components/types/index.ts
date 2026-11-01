export type Page =
  | "home" | "products" | "detail" | "cart" | "wishlist"
  | "signin" | "register" | "forgot-password"
  | "orders" | "account" | "checkout" | "order-confirmation"
  | "order-tracking" | "search" | "category" | "brands"
  | "loyalty" | "refer"
  | "about" | "contact" | "terms" | "privacy"
  | "admin-login" | "admin" | "seller-login" | "seller-register" | "seller";

export const PAGE_PATHS: Record<Page, string> = {
  home:                "/",
  products:            "/products",
  detail:              "/products",
  cart:                "/cart",
  wishlist:            "/wishlist",
  signin:              "/signin",
  register:            "/register",
  "forgot-password":   "/forgot-password",
  orders:              "/orders",
  account:             "/account",
  checkout:            "/checkout",
  "order-confirmation":"/order-confirmation",
  "order-tracking":    "/order-tracking",
  search:              "/search",
  category:            "/category",
  brands:              "/brands",
  loyalty:             "/loyalty",
  refer:               "/refer",
  about:               "/about",
  contact:             "/contact",
  terms:               "/terms",
  privacy:             "/privacy",
  "admin-login":       "/admin/login",
  admin:               "/admin",
  "seller-login":      "/seller/login",
  "seller-register":   "/seller/register",
  seller:              "/seller",
};

export type ProductVariant = {
  id: number;
  title: string;
  price: number;
  offerPrice: number;
  stock?: number;
  variationType?: string;
  sku?: string;
};

export type Prod = {
  id: number;
  name: string;
  brand: string;
  cat: string;
  subcategory?: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  off: number;
  cod: boolean;
  emi: boolean;
  freeShip: boolean;
  inStock: boolean;
  tag: string;
  tagClr: string;
  img: string;
  img2: string;
  desc: string;
  sizes: string[];
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  selectedSize?: string;
  spec: Record<string, string>;
  stock?: number;
  sku?: string;
  galleryImages?: string[];
  highlights?: string[];
  condition?: string;
  manufacturer?: string;
  madeIn?: string;
  warranty?: string;
  deliveryDays?: string;
  swatches?: string[];
};
