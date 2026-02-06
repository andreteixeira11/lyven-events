import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import {
  User,
  Settings,
  LogOut,
  Heart,
  History,
  Bell,
  HelpCircle,
  X,
  TestTube,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ visible, onClose }: HamburgerMenuProps) {
  const { user, logout } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Terminar Sessão',
      'Tem certeza que deseja terminar a sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar Sessão',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onClose();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleMenuItemPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <View style={styles.avatar}>
        <User size={32} color={COLORS.white} />
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Utilizador'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
    </View>
  );

  const renderUserMenuItems = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/(tabs)/favorites')}
      >
        <Heart size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Favoritos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => Alert.alert('Histórico', 'Funcionalidade em desenvolvimento')}
      >
        <History size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Histórico</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
    </>
  );

  const renderDevelopmentMenuItems = () => (
    <>
      <Text style={styles.sectionTitle}>Desenvolvimento</Text>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/test-seed')}
      >
        <TestTube size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Testar Seed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/login-teste')}
      >
        <User size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Login de Teste</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
    </>
  );

  const renderCommonMenuItems = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/notifications')}
      >
        <Bell size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Notificações</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/settings')}
      >
        <Settings size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Definições</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/help')}
      >
        <HelpCircle size={20} color={COLORS.white} />
        <Text style={styles.menuText}>Ajuda</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
      
      <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.primary} />
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            {renderUserInfo()}
            
            <View style={styles.menuItems}>
              {renderUserMenuItems()}
              {renderDevelopmentMenuItems()}
              {renderCommonMenuItems()}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    width: '80%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  promoterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoterText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginLeft: 4,
  },
  approvedIcon: {
    marginLeft: 4,
  },
  menuItems: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500' as const,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: 'bold' as const,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
});