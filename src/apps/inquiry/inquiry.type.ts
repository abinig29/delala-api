import { Inquiry, Product } from "@prisma/client";

export interface ExtendedInquiry extends Inquiry {
    product: Partial<Product>
}