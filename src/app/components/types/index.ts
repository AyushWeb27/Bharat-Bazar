export type Page =
  | "home" | "products" | "detail" | "cart" | "wishlist"
  | "signin" | "register" | "forgot-password"
  | "orders" | "account" | "checkout" | "order-confirmation"
  | "order-tracking" | "search" | "category"
  | "loyalty" | "refer"
  | "about" | "contact" | "terms" | "privacy"
  | "admin-login" | "admin" | "seller-login" | "seller";

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
  category:            "/category/Electronics",
  loyalty:             "/loyalty",
  refer:               "/refer",
  about:               "/about",
  contact:             "/contact",
  terms:               "/terms",
  privacy:             "/privacy",
  "admin-login":       "/admin/login",
  admin:               "/admin",
  "seller-login":      "/seller/login",
  seller:              "/seller",
};

export type Prod = {
  id: number;
  name: string;
  brand: string;
  cat: string;
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
  spec: Record<string, string>;
};
