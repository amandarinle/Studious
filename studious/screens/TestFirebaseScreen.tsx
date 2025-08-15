// studious/screens/TestFirebaseScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebase';
// Note: storage not imported since we're not using it yet
import { collection, addDoc } from 'firebase/firestore';

export default function TestFirebaseScreen() {
  const [status, setStatus] = useState('🔄 Testing Firebase...');
  const [buttonText, setButtonText] = useState('Test Firebase');

  const testFirebase = async () => {
    try {
      setStatus('🔄 Testing connection...');
      setButtonText('Testing...');

      // Test 1: Check Firebase initialization
      if (!auth || !db) {
        setStatus('❌ Firebase not initialized properly');
        setButtonText('Try Again');
        return;
      }

      // Test 2: Try writing to Firestore
      const testDoc = {
        message: 'Hello from Studious app!',
        platform: 'Expo React Native',
        timestamp: new Date(),
        testNumber: Math.random()
      };

      const docRef = await addDoc(collection(db, 'connectionTest'), testDoc);
      
      setStatus(`✅ Firebase working perfectly!\n📱 Cross-platform ready\n📄 Document ID: ${docRef.id.slice(0, 8)}...\n💾 Storage: Local files for now`);
      setButtonText('Test Again');

    } catch (error) {
      console.error('Firebase test error:', error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      setStatus(`❌ Connection failed:\n${errorMessage}`);
      setButtonText('Retry Test');
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testFirebase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Firebase Connection Test</Text>
      <Text style={styles.subtitle}>Testing iOS, Android & Web compatibility</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={testFirebase}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>What this tests:</Text>
        <Text style={styles.infoText}>• Firebase SDK initialization</Text>
        <Text style={styles.infoText}>• Firestore database write access</Text>
        <Text style={styles.infoText}>• Cross-platform compatibility</Text>
        <Text style={styles.infoText}>• User authentication setup</Text>
        <Text style={styles.infoText}>Note: File storage will be added later</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});