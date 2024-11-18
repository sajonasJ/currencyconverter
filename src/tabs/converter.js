import React, { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";


import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

const CurrencyConverter = () => {
  const url = "https://api.freecurrencyapi.com/v1/latest";
  const apik = "fca_live_DxVIn8pRa66prt3oaWi2pMUGpPhRRggDZOVlCW0i";
  const [fromCurrency, setFromCurrency] = useState("AUD");
  const [toCurrency, setToCurrency] = useState("JPY");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [isCurrencyLocked, setIsCurrencyLocked] = useState(false);
  const allowedCurrencies = [
    { name: "United States", code: "USD" },
    { name: "Australia", code: "AUD" },
    { name: "Japan", code: "JPY" },
    { name: "Philippines", code: "PHP" },
  ];

  // Load history from AsyncStorage when component mounts
  useEffect(() => {
    const loadHistoryFromStorage = async () => {
      const loadedHistory = await loadHistory();
      setHistory(loadedHistory);
      if (loadedHistory.length > 0) {
        setIsCurrencyLocked(true);
      }
    };
    loadHistoryFromStorage();
  }, []);

  // Save history to AsyncStorage
  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  const convertCurrency = async () => {
    if (!amount || isNaN(amount)) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount.",
        onPress: () => Toast.hide(),
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${url}?apikey=${apik}&currencies=${toCurrency}&base_currency=${fromCurrency}`
      );

      // Check if the response is valid (status code 200)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversion data. Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Ensure the response contains valid data
      const rate = data.data[toCurrency];
      if (!rate) {
        throw new Error(`Conversion rate for ${toCurrency} not found`);
      }

      const result = (amount * rate).toFixed(2);
      setConvertedAmount(result);

      // Add the conversion to the history
      const newHistory = [
        ...history,
        {
          amount,
          fromCurrency,
          toCurrency,
          result,
          date: new Date().toLocaleString(),
        },
      ];
      setHistory(newHistory); // Update the history
      setAmount("");
      // Lock currency selection after conversion
      setIsCurrencyLocked(true);
    } catch (error) {
      console.error("Error converting currency:", error);
      alert("There was an error converting the currency.");

      Toast.show({
        type: "error",
        position: "top",
        text1: "Conversion Failed",
        text2: "There was an error converting the currency.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    setConvertedAmount(null);
    setAmount("");
    setIsCurrencyLocked(false);

    try {
      await AsyncStorage.removeItem('@conversion_history');
      Toast.show({
        type: "success",
        position: "top",
        text1: "History Cleared",
        text2: "All conversion history has been removed.",
      });
    } catch (e) {
      console.error("Failed to clear history from storage", e);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Clear Failed",
        text2: "There was an error clearing the history.",
      });
    }
  };
  const saveHistory = async (history) => {
    try {
      const jsonValue = JSON.stringify(history);
      await AsyncStorage.setItem('@conversion_history', jsonValue);
    } catch (e) {
      console.error("Failed to save history to storage", e);
    }
  };

  const loadHistory = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@conversion_history');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Failed to load history from storage", e);
      return [];
    }
  };

  // Calculate total of all conversions and include the base currency
  const totalConvertedAmount = history
    .reduce((total, entry) => {
      return total + parseFloat(entry.result);
    }, 0)
    .toFixed(2);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Travel Expense Calculator</Text>
        <View style={styles.converterBox}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={styles.label}>Amount:</Text>
            <TextInput
              style={styles.inputInline}
              placeholder="Enter amount"
              placeholderTextColor="black"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View>
          <DropDownPicker
        open={fromDropdownOpen}
        value={fromCurrency}
        items={allowedCurrencies}
        setOpen={setFromDropdownOpen}
        setValue={setFromCurrency}
        placeholder="Select From Currency"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <DropDownPicker
        open={toDropdownOpen}
        value={toCurrency}
        items={allowedCurrencies}
        setOpen={setToDropdownOpen}
        setValue={setToCurrency}
        placeholder="Select To Currency"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

</View>



          <TouchableOpacity style={styles.button} onPress={convertCurrency}>
            <Text style={styles.buttonText}>Convert</Text>
          </TouchableOpacity>
        </View>
        <View>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            convertedAmount && (
              <Text style={styles.result}>
                {amount} {fromCurrency} = {convertedAmount} {toCurrency}
              </Text>
            )
          )}
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Conversion History</Text>
          {history.length === 0 ? (
            <Text>No history available.</Text>
          ) : (
            history.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <Text>{`${entry.amount} ${entry.fromCurrency} = ${entry.result} ${entry.toCurrency}`}</Text>
                <Text style={styles.date}>{entry.date}</Text>
              </View>
            ))
          )}
        </View>

        {history.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: {totalConvertedAmount} {toCurrency} from {fromCurrency}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.buttonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>

  );
};

// Styles...


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff", // White background
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#333", // Text color
  },
  pickerItem: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  converterBox: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },

  inputInline: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 18,
    flex: 1,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  historyContainer: {
    marginTop: 20,
    width: "100%",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 50,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputAndroid: {
    height: 50,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#333",
  },
});
export default CurrencyConverter;
