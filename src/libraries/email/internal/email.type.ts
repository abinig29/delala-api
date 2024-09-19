export enum EmailType {
  DEFAULT = 'default',
  AUTHENTICATION_WELCOME = 'register',
  AUTHENTICATION_FORGOT_PASSWORD = 'authentication.forgot.password',
  AUTHORIZATION_VERIFICATION_CODE = 'authorization.verification.code',
}

export const EmailSender = {
  default: {
    email: 'no-reply@delela.online',
    name: 'Delala',
  },
}
