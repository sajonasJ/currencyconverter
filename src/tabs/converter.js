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
  const url = 'https://api.freecurrencyapi.com/v1/latest';
  const apik = 'fca_live_DxVIn8pRa66prt3oaWi2pMUGpPhRRggDZOVlCW0i';
  const [fromCurrency, setFromCurrency] = useState("AUD");
  const [toCurrency, setToCurrency] = useState("JPY");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
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

      setConvertedAmount((amount * rate).toFixed(2));
    } catch (error) {
      console.error("Error converting currency:", error);
      alert("There was an error converting the currency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>
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
          onValueChange={(itemValue) => setFromCurrency(itemValue)}
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
          onValueChange={(itemValue) => setToCurrency(itemValue)}
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
    flex: 1, // Takes up the remaining space
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
});

export default CurrencyConverter;
