import { LastCategory, MainCategory, SubCategory } from "@prisma/client";


export interface ExtendedSubCategory extends SubCategory {
    lastCategories: LastCategory[]
}
export interface ExtendedCategory extends MainCategory {
    subCategories: ExtendedSubCategory[]
}