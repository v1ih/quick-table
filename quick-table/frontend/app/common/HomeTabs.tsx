import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

type TabType = {
  key: string;
  icon: React.ReactNode;
  label: string;
  screen: string;
  role?: string;
};

const TABS: TabType[] = [
  {
    key: 'profile',
    icon: <MaterialIcons name="person" size={28} color="#ff7a00" />,
    label: 'Perfil',
    screen: '/common/(tabs)/profile',
  },
  {
    key: 'restaurant',
    icon: <MaterialIcons name="restaurant" size={28} color="#ff7a00" />,
    label: 'Restaurante',
    screen: '/restaurant/manage-tables',
    role: 'restaurante',
  },
  {
    key: 'register-restaurant',
    icon: <MaterialIcons name="add-business" size={28} color="#ff7a00" />,
    label: 'Cadastrar Restaurante',
    screen: '/restaurant/register-restaurant',
    role: 'restaurante',
  },
  {
    key: 'edit-restaurant',
    icon: <MaterialIcons name="edit" size={28} color="#ff7a00" />,
    label: 'Editar Restaurante',
    screen: '/restaurant/edit-restaurant',
    role: 'restaurante',
  },
  {
    key: 'client-list',
    icon: <FontAwesome5 name="utensils" size={24} color="#ff7a00" />,
    label: 'Restaurantes',
    screen: '/client/list-restaurants',
    role: 'cliente',
  },
  {
    key: 'client-reservations',
    icon: <MaterialIcons name="event-seat" size={28} color="#ff7a00" />,
    label: 'Minhas Reservas',
    screen: '/client/my-reservations',
    role: 'cliente',
  },
  {
    key: 'manage-reservations',
    icon: <MaterialCommunityIcons name="clipboard-list-outline" size={28} color="#ff7a00" />,
    label: 'Reservas',
    screen: '/restaurant/manage-reservations',
    role: 'restaurante',
  },
  {
    key: 'restaurant-reviews',
    icon: <MaterialCommunityIcons name="star-circle" size={28} color="#ff7a00" />,
    label: 'Avaliações',
    screen: '/restaurant/reviews',
    role: 'restaurante',
  },
];

type TabBarProps = {
  userType?: string;
  onTabPress: (tab: TabType) => void;
  activeTab: string;
};

const TabBar = ({ userType, onTabPress, activeTab, tabs }: TabBarProps & { tabs: TabType[] }) => (
  <View style={styles.tabBar}>
    {tabs.map(tab => (
      <Pressable
        key={tab.key}
        style={styles.tabButton}
        onPress={() => onTabPress(tab)}
        onLongPress={() => alert(tab.label)}
      >
        {tab.icon}
        {activeTab === tab.key && <View style={styles.activeDot} />}
      </Pressable>
    ))}
  </View>
);

const HomeTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasRestaurant, setHasRestaurant] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchMyRestaurant = async () => {
      if (user?.tipo === 'restaurante') {
        try {
          await api.get('/restaurantes/me');
          setHasRestaurant(true);
        } catch {
          setHasRestaurant(false);
        }
      }
    };
    fetchMyRestaurant();
  }, [user]);

  // Descobre a aba ativa pelo path
  const currentTab = TABS.find(tab => pathname.startsWith(tab.screen.split('?')[0]))?.key || 'profile';

  const handleTabPress = (tab: TabType) => {
    if (tab.key !== currentTab) {
      router.replace(tab.screen as any);
    }
  };


  // Novo filtro: para restaurante, só mostra Perfil e Cadastrar Restaurante se NÃO tem restaurante,
  // e só mostra Perfil e abas de restaurante (exceto Cadastrar) se JÁ tem restaurante
  let filteredTabs: TabType[] = [];
  if (user?.tipo === 'restaurante') {
    if (hasRestaurant === false) {
      filteredTabs = TABS.filter(tab => tab.key === 'profile' || tab.key === 'register-restaurant');
    } else if (hasRestaurant === true) {
      filteredTabs = TABS.filter(tab => tab.key === 'profile' || (tab.role === 'restaurante' && tab.key !== 'register-restaurant'));
    } else {
      // Enquanto não sabe, mostra só Perfil
      filteredTabs = TABS.filter(tab => tab.key === 'profile');
    }
  } else {
    // Para outros tipos de usuário, mantém filtro padrão
    filteredTabs = TABS.filter(tab => !tab.role || tab.role === user?.tipo);
  }

  return (
    <View style={styles.container}>
      <TabBar userType={user?.tipo} onTabPress={handleTabPress} activeTab={currentTab} tabs={filteredTabs} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9fb',
    justifyContent: 'flex-end',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60, // Fixed height for tab bar
    paddingBottom: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 48,
    minWidth: 48,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff7a00',
    marginTop: 4,
  },
});

export default HomeTabs;
