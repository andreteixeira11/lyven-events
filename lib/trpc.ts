import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  eventsApi,
  authApi,
  usersApi,
  ticketsApi,
  promotersApi,
  socialApi,
  notificationsApi,
  paymentMethodsApi,
  stripeApi,
  emailsApi,
  exampleApi,
  analyticsApi,
} from './supabase-api';
import React from 'react';

function createQueryHook<TInput, TOutput>(
  key: string[],
  fn: (input: TInput) => Promise<TOutput>
) {
  return {
    useQuery: (input?: TInput, opts?: Record<string, unknown>) => {
      return useQuery<TOutput, Error>({
        queryKey: [...key, input],
        queryFn: () => fn(input as TInput),
        enabled: opts?.enabled as boolean | undefined,
        staleTime: opts?.staleTime as number | undefined,
        refetchInterval: opts?.refetchInterval as number | false | undefined,
        refetchOnMount: opts?.refetchOnMount as boolean | undefined,
      });
    },
  };
}

function createMutationHook<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>
) {
  return {
    useMutation: (opts?: Record<string, unknown>) => {
      return useMutation<TOutput, Error, TInput>({
        mutationFn: fn,
        onSuccess: opts?.onSuccess as ((data: TOutput) => void) | undefined,
        onError: opts?.onError as ((error: Error) => void) | undefined,
        onSettled: opts?.onSettled as (() => void) | undefined,
      });
    },
  };
}

export const trpc = {
  events: {
    list: createQueryHook(['events', 'list'], eventsApi.list),
    get: createQueryHook(['events', 'get'], eventsApi.get),
    search: createQueryHook(['events', 'search'], eventsApi.search),
    searchSuggestions: createQueryHook(['events', 'searchSuggestions'], eventsApi.searchSuggestions),
    statistics: createQueryHook(['events', 'statistics'], eventsApi.statistics),
    trackView: createMutationHook(eventsApi.trackView),
    getActiveViewers: createQueryHook(['events', 'getActiveViewers'], eventsApi.getActiveViewers),
    create: createMutationHook(eventsApi.create),
  },
  auth: {
    login: createMutationHook(authApi.login),
    sendVerificationCode: createMutationHook(authApi.sendVerificationCode),
    verifyCode: createMutationHook(authApi.verifyCode),
  },
  users: {
    create: createMutationHook(usersApi.create),
    get: createQueryHook(['users', 'get'], usersApi.get),
    list: createQueryHook(['users', 'list'], usersApi.list),
    updateOnboarding: createMutationHook(usersApi.updateOnboarding),
  },
  tickets: {
    list: createQueryHook(['tickets', 'list'], ticketsApi.list),
    batchCreate: createMutationHook(ticketsApi.batchCreate),
    validate: createMutationHook(ticketsApi.validate),
    generateWalletPass: createMutationHook(ticketsApi.generateWalletPass),
  },
  promoters: {
    getByUserId: createQueryHook(['promoters', 'getByUserId'], promotersApi.getByUserId),
    list: createQueryHook(['promoters', 'list'], promotersApi.list),
  },
  social: {
    follow: createMutationHook(socialApi.follow),
    unfollow: createMutationHook(socialApi.unfollow),
    isFollowing: createQueryHook(['social', 'isFollowing'], socialApi.isFollowing),
    getFollowing: createQueryHook(['social', 'getFollowing'], socialApi.getFollowing),
    getFollowers: createQueryHook(['social', 'getFollowers'], socialApi.getFollowers),
  },
  notifications: {
    registerToken: createMutationHook(notificationsApi.registerToken),
    list: createQueryHook(['notifications', 'list'], notificationsApi.list),
    send: createMutationHook(notificationsApi.send),
    markRead: createMutationHook(notificationsApi.markRead),
  },
  paymentMethods: {
    list: createQueryHook(['paymentMethods', 'list'], paymentMethodsApi.list),
    create: createMutationHook(paymentMethodsApi.create),
    update: createMutationHook(paymentMethodsApi.update),
    delete: createMutationHook(paymentMethodsApi.delete),
    setPrimary: createMutationHook(paymentMethodsApi.setPrimary),
  },
  stripe: {
    getConfig: createQueryHook(['stripe', 'getConfig'], stripeApi.getConfig),
    createCheckout: createMutationHook(stripeApi.createCheckout),
    createPaymentIntent: createMutationHook(stripeApi.createPaymentIntent),
    getSession: {
      useQuery: (input?: any, opts?: any) => {
        return useQuery({
          queryKey: ['stripe', 'getSession', input],
          queryFn: () => stripeApi.getSession(input),
          ...opts,
        });
      },
    },
  },
  emails: {
    sendTest: createMutationHook(emailsApi.sendTest),
  },
  example: {
    hi: createMutationHook(exampleApi.hi),
  },
  analytics: {
    dashboard: createQueryHook(['analytics', 'dashboard'], analyticsApi.dashboard),
    events: createQueryHook(['analytics', 'events'], analyticsApi.events),
    promoters: createQueryHook(['analytics', 'promoters'], analyticsApi.promoters),
    revenue: createQueryHook(['analytics', 'revenue'], analyticsApi.revenue),
    users: createQueryHook(['analytics', 'users'], analyticsApi.users),
  },
  useUtils: () => {
    const queryClient = useQueryClient();
    return {
      social: {
        isFollowing: {
          invalidate: (input?: any) => queryClient.invalidateQueries({ queryKey: ['social', 'isFollowing', input] }),
        },
      },
      events: {
        list: {
          invalidate: (input?: any) => queryClient.invalidateQueries({ queryKey: ['events', 'list', input] }),
        },
      },
      tickets: {
        list: {
          invalidate: (input?: any) => queryClient.invalidateQueries({ queryKey: ['tickets', 'list', input] }),
        },
      },
      notifications: {
        list: {
          invalidate: (input?: any) => queryClient.invalidateQueries({ queryKey: ['notifications', 'list', input] }),
        },
      },
      paymentMethods: {
        list: {
          invalidate: (input?: any) => queryClient.invalidateQueries({ queryKey: ['paymentMethods', 'list', input] }),
        },
      },
    };
  },
  Provider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
};

export const trpcClient = {
  events: {
    list: { query: eventsApi.list },
    get: { query: eventsApi.get },
    create: { mutate: eventsApi.create },
    search: { query: eventsApi.search },
    trackView: { mutate: eventsApi.trackView },
    getActiveViewers: { query: eventsApi.getActiveViewers },
  },
  auth: {
    login: { mutate: authApi.login },
    sendVerificationCode: { mutate: authApi.sendVerificationCode },
    verifyCode: { mutate: authApi.verifyCode },
  },
  users: {
    create: { mutate: usersApi.create },
    list: { query: usersApi.list },
    updateOnboarding: { mutate: usersApi.updateOnboarding },
  },
  tickets: {
    batchCreate: { mutate: ticketsApi.batchCreate },
    validate: { mutate: ticketsApi.validate },
  },
  example: {
    hi: { mutate: exampleApi.hi },
  },
};

export const trpcReactClient = {};

export const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (envUrl) return envUrl;
  return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '';
};
