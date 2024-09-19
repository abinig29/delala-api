export namespace AuthenticationApplicationEvent {
  export namespace UserPasswordResetRequested {
    export const key =
      'authentication.user-password-reset-requested'
    export type Payload = {
      userId: string,
      code: string

    }
  }
  export namespace UserRegistered {
    export const key = 'authentication.user-registered'
    export type Payload = {
      userId: string,
      code: string
    }
  }

  export namespace Verified {
    export const key = 'authentication.user-verified'
    export type Payload = {
      userId: string
    }
  }
}
