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
import { supabase } from '../constants/supabase';
import { useRouter, Stack } from 'expo-router';

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created successfully!");
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 🔥 REMOVE HEADER */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Signup Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Redirect */}
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>Login</Text>
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

  backText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
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

  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  loginText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});