import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        sendPushTokenToBackend(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const sendPushTokenToBackend = async (token: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        // Use your config or hardcoded backend URL
        const backendUrl = 'http://192.168.29.57:5000/api/auth/push-token';
        await axios.post(backendUrl, { token }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('Push token sent to backend');
      }
    } catch (error) {
      console.error('Failed to send push token to backend:', error);
    }
  };

  return { expoPushToken, notification };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web without a VAPID key.');
    return;
  }

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
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // expo-constants requires projectId for getting Expo token
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
    if (!projectId) {
      console.log('Project ID not found. Ensure app.json has eas.projectId configured for Expo push notifications.');
      // Fallback for simple local development without EAS
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } catch (e) {
        console.error(e);
      }
    } else {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
