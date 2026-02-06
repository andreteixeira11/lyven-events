import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import { useUser } from './user-context';

let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.log('⚠️ expo-notifications not available:', error);
  }
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Notifications || !Device) {
    console.log('⚠️ Notifications not available on this platform');
    return undefined;
  }

  let token: string | undefined;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: false,
          },
        });
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Permissão de notificação negada');
        return undefined;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Token de notificação:', token);
      } catch (error) {
        console.log('⚠️ Push notification token setup failed:', error);
        return undefined;
      }
    } else {
      console.log('Deve usar um dispositivo físico para notificações push');
    }
  } catch (error) {
    console.log('⚠️ Error during notification registration:', error);
    return undefined;
  }

  return token;
}

export const [NotificationsContext, useNotifications] = createContextHook(() => {
  const { user } = useUser();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<any>(undefined);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const registerTokenMutation = trpc.notifications.registerToken.useMutation();
  const notificationsQuery = trpc.notifications.list.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );

  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    if (!user?.id) return;

    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token);
        if (token && user.id) {
          const platform = Platform.OS === 'ios' 
            ? 'ios' 
            : Platform.OS === 'android' 
            ? 'android' 
            : 'web';
          
          registerTokenMutation.mutate({
            userId: user.id,
            token,
            platform,
          });
        }
      })
      .catch(error => {
        console.log('Notification registration skipped:', error?.message);
      });

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notificação recebida:', notification);
        setNotification(notification);
        notificationsQuery.refetch();
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Resposta à notificação:', response);
      });
    } catch (error) {
      console.log('⚠️ Failed to add notification listeners:', error);
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (error) {
        console.log('⚠️ Failed to remove notification listeners:', error);
      }
    };
  }, [user?.id, registerTokenMutation, notificationsQuery]);

  const refetchNotifications = useCallback(() => {
    return notificationsQuery.refetch();
  }, [notificationsQuery]);

  return useMemo(
    () => ({
      expoPushToken,
      notification,
      notifications: notificationsQuery.data || [],
      refetchNotifications,
    }),
    [expoPushToken, notification, notificationsQuery.data, refetchNotifications]
  );
});
