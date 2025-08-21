import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { loginSchema, registerSchema, validateSessionSchema } from "./schemas";
import {
  getUserBySession,
  login,
  logout,
  register,
  validateSession,
} from "./server";
import { db } from "@/server/db";
import { useAppSession } from "@/lib/auth";

// ## Queries ##
export const userQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: async () => await getUserBySessionFn(),
  });

// export const postsQueryOptions = (params: GetPostsParams) =>
//   queryOptions<PostDTO[]>({
//     queryKey: ["posts", params],
//     queryFn: async () => await getPostsFn({ data: params }),
//   });

// export const postQueryOptions = (id: string) =>
//   queryOptions<PostDTO>({
//     queryKey: ["post", id],
//     queryFn: () => getPostFn({ data: id }),
//   });

// export const postRankingQueryOptions = (params: GetPostRankingParams) =>
//   queryOptions<PostRankingResponse[]>({
//     queryKey: ["post-ranking", params],
//     queryFn: async () => await getPostRankingFn({ data: params }),
//   });

// ## Functions ##
export const getUserBySessionFn = createServerFn({ method: "GET" }).handler(
  async () => await getUserBySession(db)
);

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => (await useAppSession()).data
);

export const loginFn = createServerFn({ method: "POST" })
  .validator(loginSchema())
  .handler(async ({ data }) => await login(data, db));

export const registerFn = createServerFn({ method: "POST" })
  .validator(registerSchema())
  .handler(async ({ data }) => await register(data, db));

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async () => await logout(db)
);

export const validateSessionFn = createServerFn({ method: "POST" })
  .validator(validateSessionSchema())
  .handler(async ({ data }) => await validateSession(data, db));
