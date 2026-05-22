import asyncio

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)

TOKEN = "8914786768:AAGGbd_myVhzsr6qjZvF7v9k0-b0XVkEaLA"

bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="◉ Enter Operator",
                    web_app=WebAppInfo(
                        url="https://planner-self-one.vercel.app/"
                    )
                )
            ],
            [
                InlineKeyboardButton(
                    text="◉ Continue Focus",
                    web_app=WebAppInfo(
                        url="https://planner-self-one.vercel.app/"
                    )
                )
            ],
            [
                InlineKeyboardButton(
                    text="◉ Review Output",
                    web_app=WebAppInfo(
                        url="https://planner-self-one.vercel.app/"
                    )
                )
            ]
        ]
    )

    text = """
OPERATOR ONLINE

Execution environment ready.

Focus integrity: Stable
Noise level: Medium
Momentum: Active
"""

    await message.answer(
        text,
        reply_markup=kb
    )


async def main():
    await dp.start_polling(bot)


asyncio.run(main())