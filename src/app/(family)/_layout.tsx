import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="members" />
      <Stack.Screen name="booklet" />
      <Stack.Screen name="tree" />
      <Stack.Screen name="family-card" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="add-member" />
      <Stack.Screen name="setup-family" />
      <Stack.Screen name="manage-relationships" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
