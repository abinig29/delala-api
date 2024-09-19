import {
    ClassifiedDetails,
    JobDetails,
    LastCategory,
    MainCategory,
    Product,
    PropertyDetail,
    Service,
    ServiceDetails,
    SubCategory,
    VehicleDetails
} from "@prisma/client";



export interface ExtendedServiceDetail extends ServiceDetails {
    service?: Service
}

export interface ExtendedClassified extends ClassifiedDetails {
    category: MainCategory,
    subCategory: SubCategory,
    lastCategory: LastCategory
}

export interface ExtendedProduct extends Product {
    propertyDetail?: PropertyDetail,
    vehicleDetail?: VehicleDetails,
    jobDetail?: JobDetails,
    serviceDetail?: ExtendedServiceDetail,
    classifiedDetail?: ClassifiedDetails

}

export const productCategoryKeys = ['propertyDetail', 'vehicleDetail', "jobDetail", "classifiedDetail", "serviceDetail"];
