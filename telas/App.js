const FIREBASE_URL_ADMIN = "https://firestore.googleapis.com/v1/projects/projetoadm-b4da5/databases/(default)/documents/admins";
const FIREBASE_URL_FUNC = "https://firestore.googleapis.com/v1/projects/projetoadm-b4da5/databases/(default)/documents/funcionarios";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./telas/LoginScreen";
import AdminScreen from "./telas/AdminScreen";
import FuncionarioScreen from "./telas/FuncionarioScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Funcionario" component={FuncionarioScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

