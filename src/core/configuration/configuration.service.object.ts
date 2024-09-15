export namespace ConfigurationServiceObject {
  export enum Key {
    PORT = 'PORT',
    ENVIRONMENT = 'NODE_ENV',
    CLIENT_BASE_URL = 'SERVER_CLIENT_BASE_URL',
    BASE_URL = 'SERVER_BASE_URL',
  }

  export enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    STAGING = "staging"
  }


}
