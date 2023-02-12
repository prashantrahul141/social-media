import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { v2 as cloudinary } from 'cloudinary';
import { env } from 'src/env/server.mjs';
import { prisma } from 'src/server/db';

export const PostRouter = createTRPCRouter({
  getSignature: protectedProcedure.input(z.object({})).query(() => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
      },
      env.CLOUDINARY_CLOUDAPISECRET
    );

    return { timestamp: timestamp.toString(), signature };
  }),

  create: protectedProcedure
    .input(
      z.object({
        postText: z.string(),
        postImages: z
          .object({
            public_id: z.string(),
            version_number: z.number(),
            signature: z.string(),
          })
          .nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let public_id: string | null = null;
      if (input.postImages) {
        const expectedSignature = cloudinary.utils.api_sign_request(
          {
            public_id: input.postImages.public_id,
            version: input.postImages.version_number,
          },
          env.CLOUDINARY_CLOUDAPISECRET
        );

        if (input.postImages.signature === expectedSignature) {
          public_id = input.postImages.public_id;
        }
      }

      const createdPost = await prisma.post.create({
        data: {
          text: input.postText,
          image: public_id,
          Author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
          Author: {
            select: {
              username: true,
            },
          },
        },
      });

      return { createdPost };
    }),

  view: protectedProcedure.input(z.object({ postId: z.string() })).query(() => {
    return {};
  }),
});
