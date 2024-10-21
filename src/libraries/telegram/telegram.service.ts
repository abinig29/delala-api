import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { Context } from 'telegraf/typings/context';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { UserService } from '../../apps/account/user/user.service';
import { AuthService } from '../../apps/account/auth/auth.service';
import { AUTH_PROVIDER, User } from '@prisma/client';

// A simple in-memory store for user phone numbers.
// In production, consider using a database.
const userPhoneNumbers = new Map<string, string>();

@Injectable()
export class TelegramService {
    private bot: Telegraf<Context>;

    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {
        this.bot = new Telegraf(process.env.BOT_TOKEN);
        this.initializeBot();
    }

    private initializeBot() {
        this.bot.start((ctx) => {
            this.showVerifyButton(ctx);
        });
        this.bot.on('contact', async (ctx) => {
            const phoneNumber = ctx.message.contact.phone_number;
            const fullName = ctx.message.contact.first_name + " " + ctx.message.contact.last_name
            const userId = ctx.from.id.toString();
            userPhoneNumbers.set(userId, phoneNumber);
            const requestPhoneKeyboard = {
                reply_markup: {
                    keyboard: [
                        [{ text: '✅ Verify User', callback_data: 'verify_user' }],
                        [{ text: '🔑 Reset Password', callback_data: 'reset_password' }],   // Key Icon for password reset
                        [{ text: '❓ Help', callback_data: 'help' }],
                    ],
                    resize_keyboard: true,

                },
            };
            let user: User | undefined
            user = await this.userService.findOneByTelegramUserId(userId)
            if (!user) user = (await this.register(fullName, phoneNumber, userId))?.user

            console.log({ user })

            // Generate a verification token
            const res = await this.authService.sendCodeAndUpdateHash(user?.id)
            const link = `http://localhost:3000/verify?token\\=${res?.val}&userId\\=${userId}`;
            const message = `You have been verified\\! Click the link to continue:${link}`;

            ctx.replyWithMarkdownV2(message, requestPhoneKeyboard);
        });
        this.bot.on('message', (ctx) => {
            if ('text' in ctx.message) {
                const text = ctx.message.text;
                switch (text) {
                    case '✅ Verify User':
                        // this.checkIfUserExists(ctx);
                        break;
                    case ' Reset Password':
                        // this.resetPassword(ctx);
                        break;
                    case '❓ Help':
                        ctx.reply('How can I assist you?');
                        break;
                    default:
                        ctx.reply('Invalid action. Please select an option from the menu.');
                        break;
                }
            }
        })

        this.bot.help((ctx) => ctx.reply('Send your verification code here\\.'));


        this.bot.on('callback_query', (ctx) => {
            const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
            if (callbackQuery?.data === 'verify_user') {
                this.handleVerifyUser(ctx);
            }
        });

        // Handle contact sharing


        this.bot.launch();
    }

    private showVerifyButton(ctx: Context) {
        const userId = ctx.from.id.toString();
        // if (userPhoneNumbers.has(userId)) {
        //     ctx.replyWithMarkdownV2("✨ Welcome to Delala Bot ✨");
        // }
        // else {
        const verifyButton = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ Verify User', callback_data: 'verify_user' }],

                ],
            },
        };
        const welcomeMessage =
            `✨ *Welcome to Delala Bot* ✨\n\nPlease verify your account to continue\\.`;
        ctx.replyWithMarkdownV2(welcomeMessage, verifyButton);
        // }


    }

    private handleVerifyUser(ctx: Context) {
        const userId = ctx.from.id.toString();

        // Check if the user's phone number is already stored
        if (userPhoneNumbers.has(userId)) {
            console.log("what")
            // If the user already shared their phone number, send the verification link
            const verificationToken = this.generateVerificationCode();
            const link = `http://localhost:3000/verify?token=${verificationToken}`;
            const message = `You have been verified\\! Click the link to continue: [Continue to Dashboard](${link})`;

            ctx.replyWithMarkdownV2(message);
        } else {
            // Ask the user to share their phone number
            const requestPhoneKeyboard = {
                reply_markup: {
                    keyboard: [
                        [{ text: "📱 Share Phone Number", request_contact: true }],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            };

            const promptMessage =
                `Please share your phone number to complete the verification process.`;
            ctx.reply(promptMessage, requestPhoneKeyboard);
        }
    }


    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async register(
        telegramUserId: string,
        name: string,
        phone: string
    ): Promise<{ user: User }> {
        const createdUser = await this.userService.registerUser({
            fullName: name,
            accountStatus: "EMAIL_VERIFIED",
            authProvider: AUTH_PROVIDER.TELEGRAM,
            telegramUserId
        }, phone)
        return { user: createdUser }
    }

}
