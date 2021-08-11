// deno-lint-ignore-file
import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};




export type Error = {
  __typename?: 'Error';
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: User;
  loginUser: Scalars['String'];
  logoutUser: Scalars['Boolean'];
  revokeUser: Scalars['Boolean'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationLoginUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRevokeUserArgs = {
  id: Scalars['ID'];
};

export type Node = {
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  readUser?: Maybe<User>;
  readCurrentUser?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QueryReadUserArgs = {
  email: Scalars['String'];
};

export type User = Node & UserJwt & {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  receipt?: Maybe<Scalars['String']>;
};

export type UserJwt = {
  id: Scalars['ID'];
  email: Scalars['String'];
  receipt?: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Error: ResolverTypeWrapper<Error>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Node: ResolversTypes['User'];
  Query: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
  UserJWT: ResolversTypes['User'];
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Error: Error;
  String: Scalars['String'];
  Mutation: {};
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  Node: ResolversParentTypes['User'];
  Query: {};
  User: User;
  UserJWT: ResolversParentTypes['User'];
};

export type IndexDirectiveArgs = {   name: Scalars['String'];
  prefix: Scalars['String']; };

export type IndexDirectiveResolver<Result, Parent, ContextType = any, Args = IndexDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SecretDirectiveArgs = {   name: Scalars['String'];
  type: Scalars['String']; };

export type SecretDirectiveResolver<Result, Parent, ContextType = any, Args = SecretDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type TagDirectiveArgs = {  };

export type TagDirectiveResolver<Result, Parent, ContextType = any, Args = TagDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'email' | 'password'>>;
  loginUser?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationLoginUserArgs, 'email' | 'password'>>;
  logoutUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  revokeUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRevokeUserArgs, 'id'>>;
};

export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  readUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryReadUserArgs, 'email'>>;
  readCurrentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receipt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserJwtResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserJWT'] = ResolversParentTypes['UserJWT']> = {
  __resolveType: TypeResolveFn<'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receipt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Error?: ErrorResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserJWT?: UserJwtResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  index?: IndexDirectiveResolver<any, any, ContextType>;
  secret?: SecretDirectiveResolver<any, any, ContextType>;
  tag?: TagDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;

/** REDIS TYPES PLUGIN */

interface UserRedisPayload extends User { password: string; }

export const redisPrefix = {
  Node: "nodes:*:",
  User: "nodes:users:*:",
};

export type RedisPayload = {
  User: UserRedisPayload;
};

export const redisIndex = {
  Node: {
    name: "nodes",
    schemaFields: [
      { name: "$.id", type: "TAG", as: "id" }
    ],
    parameters: { prefix: [{ count: 1, name: "nodes:*:" }] },
  },
  User: {
    name: "users",
    schemaFields: [
      { name: "$.email", type: "TAG", as: "email" }
    ],
    parameters: { prefix: [{ count: 1, name: "nodes:users:*:" }] },
  },
};