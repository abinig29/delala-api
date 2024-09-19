export namespace ProductApplicationEvent {

  export namespace ProductApproved {
    export const key = 'product.admin-status.approved'
    export type Payload = {
      userId: string,
      productId: string
    }
  }

  export namespace ProductRejected {
    export const key = 'product.admin-status.rejected'
    export type Payload = {
      userId: string,
      productId: string
    }
  }


}
