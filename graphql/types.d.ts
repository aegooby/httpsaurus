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

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  user: User;
};

export type LoginUserResponse = {
  __typename?: 'LoginUserResponse';
  token: Scalars['String'];
  user: User;
};

export type LogoutUserResponse = {
  __typename?: 'LogoutUserResponse';
  success: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: CreateUserResponse;
  loginUser: LoginUserResponse;
  logoutUser: LogoutUserResponse;
  revokeUser: RevokeUserResponse;
};


export type MutationCreateUserArgs = {
  input: UserInfo;
};


export type MutationLoginUserArgs = {
  input: UserInfo;
};


export type MutationRevokeUserArgs = {
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  readUser: ReadUserResponse;
  readCurrentUser: ReadUserResponse;
};


export type QueryReadUserArgs = {
  id: Scalars['ID'];
};

export type ReadUserResponse = {
  __typename?: 'ReadUserResponse';
  user: User;
};

export type RevokeUserResponse = {
  __typename?: 'RevokeUserResponse';
  success: Scalars['Boolean'];
};

export type User = UserJwt & {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  receipt?: Maybe<Scalars['String']>;
};

export type UserInfo = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UserJwt = {
  id: Scalars['ID'];
  email: Scalars['String'];
  receipt?: Maybe<Scalars['String']>;
};

export type UserPayload = {
  email: Scalars['String'];
  receipt?: Maybe<Scalars['String']>;
  password: Scalars['String'];
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
  CreateUserResponse: ResolverTypeWrapper<CreateUserResponse>;
  LoginUserResponse: ResolverTypeWrapper<LoginUserResponse>;
  String: ResolverTypeWrapper<Scalars['String']>;
  LogoutUserResponse: ResolverTypeWrapper<LogoutUserResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Mutation: ResolverTypeWrapper<{}>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Query: ResolverTypeWrapper<{}>;
  ReadUserResponse: ResolverTypeWrapper<ReadUserResponse>;
  RevokeUserResponse: ResolverTypeWrapper<RevokeUserResponse>;
  User: ResolverTypeWrapper<User>;
  UserInfo: UserInfo;
  UserJWT: ResolversTypes['User'];
  UserPayload: never;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  CreateUserResponse: CreateUserResponse;
  LoginUserResponse: LoginUserResponse;
  String: Scalars['String'];
  LogoutUserResponse: LogoutUserResponse;
  Boolean: Scalars['Boolean'];
  Mutation: {};
  ID: Scalars['ID'];
  Query: {};
  ReadUserResponse: ReadUserResponse;
  RevokeUserResponse: RevokeUserResponse;
  User: User;
  UserInfo: UserInfo;
  UserJWT: ResolversParentTypes['User'];
  UserPayload: never;
};

export type CreateUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserResponse'] = ResolversParentTypes['CreateUserResponse']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginUserResponse'] = ResolversParentTypes['LoginUserResponse']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogoutUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LogoutUserResponse'] = ResolversParentTypes['LogoutUserResponse']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createUser?: Resolver<ResolversTypes['CreateUserResponse'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  loginUser?: Resolver<ResolversTypes['LoginUserResponse'], ParentType, ContextType, RequireFields<MutationLoginUserArgs, 'input'>>;
  logoutUser?: Resolver<ResolversTypes['LogoutUserResponse'], ParentType, ContextType>;
  revokeUser?: Resolver<ResolversTypes['RevokeUserResponse'], ParentType, ContextType, RequireFields<MutationRevokeUserArgs, 'id'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  readUser?: Resolver<ResolversTypes['ReadUserResponse'], ParentType, ContextType, RequireFields<QueryReadUserArgs, 'id'>>;
  readCurrentUser?: Resolver<ResolversTypes['ReadUserResponse'], ParentType, ContextType>;
};

export type ReadUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReadUserResponse'] = ResolversParentTypes['ReadUserResponse']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RevokeUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RevokeUserResponse'] = ResolversParentTypes['RevokeUserResponse']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type UserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserPayload'] = ResolversParentTypes['UserPayload']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receipt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CreateUserResponse?: CreateUserResponseResolvers<ContextType>;
  LoginUserResponse?: LoginUserResponseResolvers<ContextType>;
  LogoutUserResponse?: LogoutUserResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReadUserResponse?: ReadUserResponseResolvers<ContextType>;
  RevokeUserResponse?: RevokeUserResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserJWT?: UserJwtResolvers<ContextType>;
  UserPayload?: UserPayloadResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
