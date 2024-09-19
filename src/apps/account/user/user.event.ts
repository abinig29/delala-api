export namespace UserApplicationEvent {

  export namespace AdminRegistered {
    export const key = 'user.admin-registered'
    export type Payload = {
      userId: string,
      password: string
    }
  }


}
