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
  advertisementsApi,
  affiliatesApi,
  bundlesApi,
  priceAlertsApi,
  identityApi,
  recommendationsApi,
  webhooksApi,
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
    create: createMutationHook(eventsApi.create),
    update: createMutationHook(eventsApi.update),
    delete: createMutationHook(eventsApi.delete),
    approve: createMutationHook(eventsApi.approve),
    reject: createMutationHook(eventsApi.reject),
    listPending: createQueryHook(['events', 'listPending'], eventsApi.listPending),
    getPendingDetails: createQueryHook(['events', 'getPendingDetails'], eventsApi.getPendingDetails),
    setFeatured: createMutationHook(eventsApi.setFeatured),
    search: createQueryHook(['events', 'search'], eventsApi.search),
    searchSuggestions: createQueryHook(['events', 'searchSuggestions'], eventsApi.searchSuggestions),
    statistics: createQueryHook(['events', 'statistics'], eventsApi.statistics),
    trackView: createMutationHook(eventsApi.trackView),
    getActiveViewers: createQueryHook(['events', 'getActiveViewers'], eventsApi.getActiveViewers),
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
    update: createMutationHook(usersApi.update),
    delete: createMutationHook(usersApi.delete),
    updateOnboarding: createMutationHook(usersApi.updateOnboarding),
  },
  tickets: {
    create: createMutationHook(ticketsApi.create),
    batchCreate: createMutationHook(ticketsApi.batchCreate),
    get: createQueryHook(['tickets', 'get'], ticketsApi.get),
    list: createQueryHook(['tickets', 'list'], ticketsApi.list),
    validate: createMutationHook(ticketsApi.validate),
    cancel: createMutationHook(ticketsApi.cancel),
    transfer: createMutationHook(ticketsApi.transfer),
    addToCalendar: createMutationHook(ticketsApi.addToCalendar),
    setReminder: createMutationHook(ticketsApi.setReminder),
    generateWalletPass: createMutationHook(ticketsApi.generateWalletPass),
  },
  promoters: {
    create: createMutationHook(promotersApi.create),
    get: createQueryHook(['promoters', 'get'], promotersApi.get),
    getByUserId: createQueryHook(['promoters', 'getByUserId'], promotersApi.getByUserId),
    update: createMutationHook(promotersApi.update),
    delete: createMutationHook(promotersApi.delete),
    list: createQueryHook(['promoters', 'list'], promotersApi.list),
    listPending: createQueryHook(['promoters', 'listPending'], promotersApi.listPending),
    approve: createMutationHook(promotersApi.approve),
    reject: createMutationHook(promotersApi.reject),
    stats: createQueryHook(['promoters', 'stats'], promotersApi.stats),
  },
  advertisements: {
    create: createMutationHook(advertisementsApi.create),
    get: createQueryHook(['advertisements', 'get'], advertisementsApi.get),
    update: createMutationHook(advertisementsApi.update),
    delete: createMutationHook(advertisementsApi.delete),
    list: createQueryHook(['advertisements', 'list'], advertisementsApi.list),
    listPending: createQueryHook(['advertisements', 'listPending'], advertisementsApi.listPending),
    approve: createMutationHook(advertisementsApi.approve),
    recordImpression: createMutationHook(advertisementsApi.recordImpression),
    recordClick: createMutationHook(advertisementsApi.recordClick),
    stats: createQueryHook(['advertisements', 'stats'], advertisementsApi.stats),
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
  affiliates: {
    create: createMutationHook(affiliatesApi.create),
    getByUser: createQueryHook(['affiliates', 'getByUser'], affiliatesApi.getByUser),
    getByCode: createQueryHook(['affiliates', 'getByCode'], affiliatesApi.getByCode),
    recordSale: createMutationHook(affiliatesApi.recordSale),
    stats: createQueryHook(['affiliates', 'stats'], affiliatesApi.stats),
  },
  bundles: {
    create: createMutationHook(bundlesApi.create),
    list: createQueryHook(['bundles', 'list'], bundlesApi.list),
    get: createQueryHook(['bundles', 'get'], bundlesApi.get),
  },
  priceAlerts: {
    create: createMutationHook(priceAlertsApi.create),
    list: createQueryHook(['priceAlerts', 'list'], priceAlertsApi.list),
    delete: createMutationHook(priceAlertsApi.delete),
  },
  identity: {
    createVerification: createMutationHook(identityApi.createVerification),
    getStatus: createQueryHook(['identity', 'getStatus'], identityApi.getStatus),
  },
  recommendations: {
    smart: createQueryHook(['recommendations', 'smart'], recommendationsApi.smart),
    ai: createQueryHook(['recommendations', 'ai'], recommendationsApi.ai),
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
  webhooks: {
    createEvent: createMutationHook(webhooksApi.createEvent),
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
        listPending: {
          invalidate: () => queryClient.invalidateQueries({ queryKey: ['events', 'listPending'] }),
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
      promoters: {
        list: {
          invalidate: () => queryClient.invalidateQueries({ queryKey: ['promoters', 'list'] }),
        },
        listPending: {
          invalidate: () => queryClient.invalidateQueries({ queryKey: ['promoters', 'listPending'] }),
        },
      },
      advertisements: {
        list: {
          invalidate: () => queryClient.invalidateQueries({ queryKey: ['advertisements', 'list'] }),
        },
      },
      analytics: {
        dashboard: {
          invalidate: () => queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] }),
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
    update: { mutate: eventsApi.update },
    delete: { mutate: eventsApi.delete },
    approve: { mutate: eventsApi.approve },
    reject: { mutate: eventsApi.reject },
    listPending: { query: eventsApi.listPending },
    setFeatured: { mutate: eventsApi.setFeatured },
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
    get: { query: usersApi.get },
    list: { query: usersApi.list },
    update: { mutate: usersApi.update },
    delete: { mutate: usersApi.delete },
    updateOnboarding: { mutate: usersApi.updateOnboarding },
  },
  tickets: {
    create: { mutate: ticketsApi.create },
    batchCreate: { mutate: ticketsApi.batchCreate },
    get: { query: ticketsApi.get },
    list: { query: ticketsApi.list },
    validate: { mutate: ticketsApi.validate },
    cancel: { mutate: ticketsApi.cancel },
    transfer: { mutate: ticketsApi.transfer },
  },
  promoters: {
    create: { mutate: promotersApi.create },
    get: { query: promotersApi.get },
    getByUserId: { query: promotersApi.getByUserId },
    update: { mutate: promotersApi.update },
    delete: { mutate: promotersApi.delete },
    list: { query: promotersApi.list },
    listPending: { query: promotersApi.listPending },
    approve: { mutate: promotersApi.approve },
    reject: { mutate: promotersApi.reject },
    stats: { query: promotersApi.stats },
  },
  advertisements: {
    create: { mutate: advertisementsApi.create },
    get: { query: advertisementsApi.get },
    update: { mutate: advertisementsApi.update },
    delete: { mutate: advertisementsApi.delete },
    list: { query: advertisementsApi.list },
    approve: { mutate: advertisementsApi.approve },
    stats: { query: advertisementsApi.stats },
  },
  social: {
    follow: { mutate: socialApi.follow },
    unfollow: { mutate: socialApi.unfollow },
    isFollowing: { query: socialApi.isFollowing },
    getFollowing: { query: socialApi.getFollowing },
    getFollowers: { query: socialApi.getFollowers },
  },
  notifications: {
    list: { query: notificationsApi.list },
    send: { mutate: notificationsApi.send },
    markRead: { mutate: notificationsApi.markRead },
  },
  affiliates: {
    create: { mutate: affiliatesApi.create },
    getByUser: { query: affiliatesApi.getByUser },
    getByCode: { query: affiliatesApi.getByCode },
    recordSale: { mutate: affiliatesApi.recordSale },
    stats: { query: affiliatesApi.stats },
  },
  bundles: {
    create: { mutate: bundlesApi.create },
    list: { query: bundlesApi.list },
    get: { query: bundlesApi.get },
  },
  priceAlerts: {
    create: { mutate: priceAlertsApi.create },
    list: { query: priceAlertsApi.list },
    delete: { mutate: priceAlertsApi.delete },
  },
  identity: {
    createVerification: { mutate: identityApi.createVerification },
    getStatus: { query: identityApi.getStatus },
  },
  recommendations: {
    smart: { query: recommendationsApi.smart },
    ai: { query: recommendationsApi.ai },
  },
  analytics: {
    dashboard: { query: analyticsApi.dashboard },
    events: { query: analyticsApi.events },
    promoters: { query: analyticsApi.promoters },
    revenue: { query: analyticsApi.revenue },
    users: { query: analyticsApi.users },
  },
  stripe: {
    getConfig: { query: stripeApi.getConfig },
    createCheckout: { mutate: stripeApi.createCheckout },
    createPaymentIntent: { mutate: stripeApi.createPaymentIntent },
    getSession: { query: stripeApi.getSession },
  },
  emails: {
    sendTest: { mutate: emailsApi.sendTest },
  },
  webhooks: {
    createEvent: { mutate: webhooksApi.createEvent },
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
