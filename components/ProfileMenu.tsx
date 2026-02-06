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
  BarChart3,
  Calendar,
  Heart,
  History,
  Shield,
  HelpCircle,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { router } from 'expo-router';



interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const { user, promoterProfile, logout } = useUser();

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
        <User size={32} color="#fff" />
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Utilizador'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.userType === 'promoter' && (
          <View style={styles.promoterBadge}>
            <Star size={12} color="#FFD700" />
            <Text style={styles.promoterText}>Promotor</Text>
            {promoterProfile?.isApproved && (
              <Shield size={12} color="#00C851" style={styles.approvedIcon} />
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderPromoterMenuItems = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/promoter-dashboard')}
      >
        <BarChart3 size={20} color="#fff" />
        <Text style={styles.menuText}>Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/my-events')}
      >
        <Calendar size={20} color="#fff" />
        <Text style={styles.menuText}>Meus Eventos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/analytics')}
      >
        <TrendingUp size={20} color="#fff" />
        <Text style={styles.menuText}>Estatísticas</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/followers')}
      >
        <Users size={20} color="#fff" />
        <Text style={styles.menuText}>Seguidores</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
    </>
  );

  const renderUserMenuItems = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/(tabs)/favorites')}
      >
        <Heart size={20} color="#fff" />
        <Text style={styles.menuText}>Favoritos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/event-history')}
      >
        <History size={20} color="#fff" />
        <Text style={styles.menuText}>Histórico</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
    </>
  );

  const renderCommonMenuItems = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/settings')}
      >
        <Settings size={20} color="#fff" />
        <Text style={styles.menuText}>Definições</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleMenuItemPress('/help')}
      >
        <HelpCircle size={20} color="#fff" />
        <Text style={styles.menuText}>Ajuda</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
      
      <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
        <LogOut size={20} color="#FF385C" />
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={1}>
            {renderUserInfo()}
            
            <View style={styles.menuItems}>
              {user?.userType === 'promoter'
                ? renderPromoterMenuItems()
                : renderUserMenuItems()}
              
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
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '75%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  userEmail: {
    color: '#999',
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
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
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
    color: '#FF385C',
    fontSize: 16,
    marginLeft: 16,
    fontWeight: 'bold' as const,
  },
  approvedIcon: {
    marginLeft: 4,
  },
});