import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import CurrencyConverter from "./src/tabs/converter";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <View style={styles.container}>
      <CurrencyConverter />
      <StatusBar style="auto" />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});