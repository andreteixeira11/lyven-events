import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { EVENT_CATEGORIES, MUSIC_GENRES } from '@/constants/onboarding';
import { COLORS } from '@/constants/colors';

interface InterestsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function InterestsStep({ data, onUpdate }: InterestsStepProps) {
  const [selectedTab, setSelectedTab] = useState<'categories' | 'music'>('categories');
  const selectedInterests = data.interests || [];

  const handleToggleInterest = (interest: string) => {
    const updatedInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((item: string) => item !== interest)
      : [...selectedInterests, interest];
    
    onUpdate({ interests: updatedInterests });
  };

  const currentList = selectedTab === 'categories' ? EVENT_CATEGORIES : MUSIC_GENRES;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'categories' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('categories')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'categories' && styles.tabTextActive,
          ]}>
            Categorias
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'music' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('music')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'music' && styles.tabTextActive,
          ]}>
            Géneros Musicais
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {currentList.map((item) => {
            const isSelected = selectedInterests.includes(item);
            
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.interestItem,
                  isSelected && styles.interestItemSelected,
                ]}
                onPress={() => handleToggleInterest(item)}
              >
                <Text style={[
                  styles.interestText,
                  isSelected && styles.interestTextSelected,
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedInterests.length} selecionados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestItem: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  interestItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  interestTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold' as const,
  },
  footer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  selectedCount: {
    color: COLORS.black,
    fontSize: 14,
  },
});