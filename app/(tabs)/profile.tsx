import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: (typeof Colors)['light'];
}

function SettingRow({ icon, label, value, onPress, rightElement, colors }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { borderBottomColor: colors.divider, opacity: pressed && onPress ? 0.75 : 1 },
      ]}
      accessibilityRole={onPress ? 'button' : 'none'}>
      <View style={[styles.settingIconWrap, { backgroundColor: colors.chipInactive }]}>
        <Ionicons name={icon} size={18} color={colors.icon} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { bookmarks, colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <Pressable
          style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Edit profile">
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background }]}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?u=newsflip-user' }}
            style={styles.avatar}
            accessibilityLabel="Profile picture"
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>Alex Johnson</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>alex@newsflip.app</Text>
          </View>
          <View style={[styles.premiumBadge, { backgroundColor: colors.tagBackground }]}>
            <Ionicons name="star" size={12} color={colors.tagText} />
            <Text style={[styles.premiumBadgeText, { color: colors.tagText }]}>Premium</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
          {[
            { label: 'Saved', value: bookmarks.length.toString() },
            { label: 'Articles Read', value: '142' },
            { label: 'Following', value: '8' },
          ].map((stat, i) => (
            <View
              key={stat.label}
              style={[
                styles.statItem,
                i < 2 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
              ]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <View style={[styles.settingsGroup, { backgroundColor: colors.background }]}>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <SettingRow
            icon="newspaper-outline"
            label="Reading Mode"
            value="Comfortable"
            onPress={() => {}}
            colors={colors}
          />
          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            colors={colors}
            rightElement={
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle notifications"
              />
            }
          />
          <SettingRow
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {}}
            colors={colors}
          />
          <SettingRow
            icon="globe-outline"
            label="Region"
            value="Global"
            onPress={() => {}}
            colors={colors}
          />
        </View>

        {/* Account */}
        <View style={[styles.settingsGroup, { backgroundColor: colors.background }]}>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <SettingRow icon="shield-checkmark-outline" label="Privacy" onPress={() => {}} colors={colors} />
          <SettingRow icon="lock-closed-outline" label="Security" onPress={() => {}} colors={colors} />
          <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} colors={colors} />
          <SettingRow icon="information-circle-outline" label="About NewsFlip" value="v1.0.0" onPress={() => {}} colors={colors} />
        </View>

        {/* Sign out */}
        <View style={[styles.signOutSection, { backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutBtn,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign out">
            <Ionicons name="log-out-outline" size={18} color={colors.errorText} />
            <Text style={[styles.signOutText, { color: colors.errorText }]}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
  },
  editBtn: {
    padding: 4,
  },
  scroll: { flex: 1 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  email: {
    fontSize: FontSizes.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  premiumBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSizes.sm,
  },
  settingsGroup: {
    marginBottom: Spacing.sm,
    paddingTop: Spacing.md,
  },
  groupTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingValue: {
    fontSize: FontSizes.sm,
  },
  signOutSection: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  bottomPad: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
