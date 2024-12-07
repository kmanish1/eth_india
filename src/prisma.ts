import { PrismaClient } from "@prisma/client";
import { TokenResponse, UserContext } from "./types/type";

const prisma = new PrismaClient();

export const resetUserState = async (userId: string): Promise<void> => {
    await prisma.userState.deleteMany({ where: { userId } });
};

export const getUserState = async (
    userId: string
): Promise<{ stage: string; context: UserContext }> => {
    let state = await prisma.userState.findUnique({ where: { userId } });

    if (!state) {
        state = await prisma.userState.create({
            data: {
                userId,
                stage: "neutral",
                context: JSON.stringify({ isAI: true }),
            },
        });
    }

    return {
        stage: state.stage,
        context: JSON.parse(state.context) as UserContext,
    };
};

export const updateUserState = async (
    userId: string,
    updates: { stage?: string; context?: UserContext }
): Promise<void> => {
    const contextString = updates.context
        ? JSON.stringify(updates.context)
        : undefined;

    await prisma.userState.update({
        where: { userId },
        data: {
            ...(updates.stage && { stage: updates.stage }),
            ...(contextString && { context: contextString }),
        },
    });
};

export const saveTokens = async (
    userId: string,
    tokens: TokenResponse
  ): Promise<void> => {
    const { auth_token, refresh_auth_token, device_token, trace_id } = tokens;
  
    await prisma.userAuth.upsert({
      where: { userId },
      update: {
        authToken: auth_token,
        refreshToken: refresh_auth_token,
        deviceToken: device_token,
      },
      create: {
        userId,
        authToken: auth_token,
        refreshToken: refresh_auth_token,
        deviceToken: device_token,
      },
    });
  };