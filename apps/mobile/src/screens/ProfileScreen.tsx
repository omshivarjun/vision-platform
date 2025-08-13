import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    language: 'English',
    accessibilityLevel: 'Standard',
    notifications: true,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'history', label: 'History', icon: 'time' },
    { id: 'glossary', label: 'Glossary', icon: 'book' },
  ]

  const translationHistory = [
    { id: 1, from: 'Hello world', to: 'Hola mundo', fromLang: 'English', toLang: 'Spanish', date: '2025-08-12' },
    { id: 2, from: 'Good morning', to: 'Bonjour', fromLang: 'English', toLang: 'French', date: '2025-08-11' },
    { id: 3, from: 'Thank you', to: 'Danke', fromLang: 'English', toLang: 'German', date: '2025-08-10' },
  ]

  const personalGlossary = [
    { term: 'API', definition: 'Application Programming Interface', language: 'English' },
    { term: 'Machine Learning', definition: 'AI technique for pattern recognition', language: 'English' },
    { term: 'Accessibility', definition: 'Design for users with disabilities', language: 'English' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={48} color="#2563eb" />
              </View>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={userProfile.name}
                  onChangeText={(text) => setUserProfile({ ...userProfile, name: text })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={userProfile.email}
                  onChangeText={(text) => setUserProfile({ ...userProfile, email: text })}
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>
        )

      case 'settings':
        return (
          <View style={styles.tabContent}>
            <View style={styles.settingsCard}>
              <Text style={styles.cardTitle}>Translation Settings</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Default Language</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{userProfile.language}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Accessibility Level</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{userProfile.accessibilityLevel}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <Text style={styles.cardTitle}>Preferences</Text>
              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => setUserProfile({ ...userProfile, notifications: !userProfile.notifications })}
              >
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <View style={[styles.toggle, userProfile.notifications && styles.toggleActive]}>
                  {userProfile.notifications && <View style={styles.toggleDot} />}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )

      case 'history':
        return (
          <View style={styles.tabContent}>
            <View style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Translation History</Text>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download" size={16} color="#2563eb" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.historyList}>
                {translationHistory.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyContent}>
                      <View style={styles.historyMeta}>
                        <Ionicons name="language" size={16} color="#6b7280" />
                        <Text style={styles.historyMetaText}>
                          {item.fromLang} → {item.toLang}
                        </Text>
                      </View>
                      <Text style={styles.historyFrom}>{item.from}</Text>
                      <Text style={styles.historyTo}>{item.to}</Text>
                    </View>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )

      case 'glossary':
        return (
          <View style={styles.tabContent}>
            <View style={styles.glossaryCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Glossary</Text>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="add" size={16} color="#2563eb" />
                  <Text style={styles.actionButtonText}>Add Term</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.glossaryList}>
                {personalGlossary.map((item, index) => (
                  <View key={index} style={styles.glossaryItem}>
                    <View style={styles.glossaryContent}>
                      <Text style={styles.glossaryTerm}>{item.term}</Text>
                      <Text style={styles.glossaryDefinition}>{item.definition}</Text>
                      <Text style={styles.glossaryLanguage}>{item.language}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton}>
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person" size={32} color="#2563eb" />
          <Text style={styles.title}>User Profile</Text>
          <Text style={styles.subtitle}>
            Manage your account settings and preferences
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? '#2563eb' : '#6b7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#dbeafe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  tabContent: {
    gap: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#2563eb',
  },
  toggleDot: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginLeft: 20,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyFrom: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  historyTo: {
    fontSize: 16,
    color: '#374151',
  },
  historyDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  glossaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  glossaryList: {
    gap: 12,
  },
  glossaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  glossaryContent: {
    flex: 1,
  },
  glossaryTerm: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  glossaryDefinition: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  glossaryLanguage: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
  },
})

export default ProfileScreen

