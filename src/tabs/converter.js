import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Picker,
  ActivityIndicator,
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
  const [isCurrencyLocked, setIsCurrencyLocked] = useState(false);
  const allowedCurrencies = [
    { name: "United States", code: "USD" },
    { name: "Australia", code: "AUD" },
    { name: "Japan", code: "JPY" },
    { name: "Philippines", code: "PHP" },
  ];

  const convertCurrency = async () => {
    if (!amount || isNaN(amount)) return alert("Please enter a valid amount");

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
      setHistory([
        ...history,
        {
          amount,
          fromCurrency,
          toCurrency,
          result,
          date: new Date().toLocaleString(),
        },
      ]);

      // Lock currency selection after conversion
      setIsCurrencyLocked(true);

    } catch (error) {
      console.error("Error converting currency:", error);
      alert("There was an error converting the currency.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setConvertedAmount(null);
    setAmount("");
    setIsCurrencyLocked(false);
    setFromCurrency("AUD");
    setToCurrency("JPY");
  };

  // Calculate total of all conversions and include the base currency
  const totalConvertedAmount = history.reduce((total, entry) => {
    return total + parseFloat(entry.result);
  }, 0).toFixed(2);

  return (
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
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Picker
          selectedValue={fromCurrency}
          style={styles.picker}
          onValueChange={(itemValue) => !isCurrencyLocked && setFromCurrency(itemValue)}
          enabled={!isCurrencyLocked} // Disable if currency is locked
        >
          {allowedCurrencies.map((item) => (
            <Picker.Item
              label={`${item.code} - ${item.name}`}
              value={item.code}
              key={item.code}
            />
          ))}
        </Picker>

        <Picker
          selectedValue={toCurrency}
          style={styles.picker}
          onValueChange={(itemValue) => !isCurrencyLocked && setToCurrency(itemValue)}
          enabled={!isCurrencyLocked} // Disable if currency is locked
        >
          {allowedCurrencies.map((item) => (
            <Picker.Item
              label={`${item.code} - ${item.name}`}
              value={item.code}
              key={item.code}
            />
          ))}
        </Picker>

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
            Total Converted: {totalConvertedAmount} {toCurrency} from {fromCurrency}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.buttonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
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

export default CurrencyConverter;
