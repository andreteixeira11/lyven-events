import { Tabs } from "expo-router";
import { Search, Ticket, Home, User, BarChart3, Calendar, Target, Users, Eye, Settings as SettingsIcon, TrendingUp } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/hooks/cart-context";
import { useUser } from "@/hooks/user-context";
import { useTheme } from "@/hooks/theme-context";

export default function TabLayout() {
  const { getTotalItems } = useCart();
  const { user } = useUser();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const totalItems = getTotalItems();
  const isPromoter = user?.userType === 'promoter';
  const isAdmin = user?.email === 'geral@lyven.pt';

  const AnimatedTabIcon = ({ 
    Icon, 
    color, 
    focused, 
    children 
  }: { 
    Icon: any; 
    color: string; 
    focused: boolean; 
    children?: React.ReactNode;
  }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
    const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
    const slideAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
      if (focused) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(glowAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.9,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(glowAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused, scaleAnim, glowAnim, slideAnim]);

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -3],
    });

    return (
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowAnim }],
            },
          ]}
        >
          <View style={[styles.glowEffect, { 
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          }]} />
        </Animated.View>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY },
              ],
            },
          ]}
        >
          <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          {children}
        </Animated.View>
      </View>
    );
  };

  if (isAdmin) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600' as const,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={BarChart3} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Utilizadores",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Users} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Aprovações",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Eye} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="ad-purchase"
          options={{
            title: "Estatísticas",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={TrendingUp} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Definições",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={SettingsIcon} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="promoter-events"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  if (isPromoter) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600' as const,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={BarChart3} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="promoter-events"
          options={{
            title: "Eventos",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Calendar} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="ad-purchase"
          options={{
            title: "Anúncios",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Target} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Procurar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Bilhetes",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Ticket} color={color} focused={focused}>
              {totalItems > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={[styles.badgeText, { color: colors.white }]}>{totalItems}</Text>
                </View>
              )}
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="promoter-events"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ad-purchase"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 45,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  glowEffect: {
    width: 52,
    height: 52,
    borderRadius: 26,
    opacity: 0.15,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 0 20px rgba(0, 153, 168, 0.4)',
      },
    }),
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
});