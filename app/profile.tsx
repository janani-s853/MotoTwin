import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../constants/supabase';

export default function Profile() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert("Location permission denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`
      );

      const data = await response.json();

      if (data && data.display_name) {
        setPlace(data.display_name);
      }

    } catch (err) {
      console.log(err);
      alert("Failed to fetch location name");
    }
  };

  const saveProfile = async () => {
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert("User not found");
      setLoading(false);
      return;
    }

    if (!name || !emailContact || !location) {
      alert("Please fill all fields and fetch location");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      name,
      emergency_email: emailContact,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile Saved Successfully!");
      router.replace('/dashboard'); // 🔥 REDIRECT
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >

        <Text style={styles.title}>Profile Setup</Text>
        <Text style={styles.subtitle}>Complete your details</Text>

        <View style={styles.inputContainer}>
          
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Emergency Contact Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={emailContact}
            onChangeText={setEmailContact}
          />

        </View>

        <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
          <Text style={styles.locationText}>Get Home Location 📍</Text>
        </TouchableOpacity>

        {place !== '' && (
          <Text style={styles.locationDisplay}>
            📍 {place}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 40,
  },

  inputContainer: {
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },

  locationBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
  },

  locationText: {
    color: '#fff',
    fontWeight: '500',
  },

  locationDisplay: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 13,
  },

  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});