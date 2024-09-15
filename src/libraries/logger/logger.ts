import { WinstonLogger } from './internal/winston.service'
import { LoggerService as NestLoggerService } from '@nestjs/common';


type ConstructorOptions = {
  instance: WinstonLogger
  name?: string
}

export class Logger implements NestLoggerService {
  private instance: WinstonLogger
  private name: string

  constructor(options: ConstructorOptions) {
    this.instance = options.instance
    this.name = options.name
  }

  log(message: string, data?: Record<string, any>): void {
    this.instance.info(this.buildMessage(message), { data })
  }

  warn(message: string): void {
    this.instance.warn(this.buildMessage(`[warning] ${message}`))
  }

  success(message: string): void {
    this.instance.info(this.buildMessage(`[SUCCESS] ${message}`))
  }

  error(error: Error | string): void {
    const isString = typeof error === 'string'
    const message = isString ? error : error.message

    this.instance.error(this.buildMessage(message))
  }

  private buildMessage(message: string): string {
    if (this.name) {
      return `${message} (${this.name})`
    }

    return message
  }
}
