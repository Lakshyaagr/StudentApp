import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import database from "@react-native-firebase/database";

// Country → State → City Data
const data = {
  India: {
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  },
  USA: {
    California: ["Los Angeles", "San Francisco"],
    Texas: ["Houston", "Dallas"],
  },
};

function StudentForm({ navigation, route }) {
  const editingStudent = route.params?.student || null;

  const [form, setForm] = useState({
    id: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
    fees: "0",
    date: "",
    payment: "",
    country: "",
    state: "",
    city: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      setForm(editingStudent);
    }
  }, [editingStudent]);

  const handleChange = (field, value) => {
    let updatedForm = { ...form, [field]: value };
    if (field === "country") {
      updatedForm.state = "";
      updatedForm.city = "";
    }
    if (field === "state") {
      updatedForm.city = "";
    }
    setForm(updatedForm);
  };

  const validate = () => {
    if (!form.name || !form.mobile || !form.payment) {
      Alert.alert("Error", "Name, Mobile No, and Payment Mode are required.");
      return false;
    }
    if (form.fees !== "0" && !form.date) {
      Alert.alert("Error", "Date is required when Fees > 0.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (validate()) {
      try {
        if (editingStudent?.id) {
          // Update student
          await database().ref(`/students/${editingStudent.id}`).update(form);
          Alert.alert("Success", "Student updated successfully!");
        } else {
          // Add new student
          const newRef = database().ref("/students").push();
          await newRef.set({ ...form, id: newRef.key });
          Alert.alert("Success", "Student saved successfully!");
        }

        // Reset form
        setForm({
          id: "",
          name: "",
          mobile: "",
          email: "",
          address: "",
          fees: "0",
          date: "",
          payment: "",
          country: "",
          state: "",
          city: "",
        });

        navigation.navigate("StudentList");
      } catch (error) {
        console.error("Firebase Error:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "height" : "padding"}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
          <Text style={styles.heading}>
            {editingStudent ? "Edit Student" : "Student Registration Form"}
          </Text>

          {/* Name */}
          <Text style={styles.label}>Student Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(t) => handleChange("name", t)}
            placeholder="Enter student name"
          />

          {/* Mobile */}
          <Text style={styles.label}>Mobile No *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={10}
            value={form.mobile}
            onChangeText={(t) => handleChange("mobile", t)}
            placeholder="Enter mobile no"
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            placeholder="Enter email"
          />

          {/* Country Dropdown */}
          <Text style={styles.label}>Country</Text>
          <Picker selectedValue={form.country} onValueChange={(val) => handleChange("country", val)} >
            <Picker.Item label="Select Country" value="" style={{ color: "black" }} />
            {Object.keys(data).map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>

          {/* State Dropdown */}
          {form.country ? (
            <>
              <Text style={styles.label}>State</Text>
              <Picker selectedValue={form.state} onValueChange={(val) => handleChange("state", val)}>
                <Picker.Item label="Select State" value=""  style={{ color: "black" }} />
                {Object.keys(data[form.country]).map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </>
          ) : null}

          {/* City Dropdown */}
          {form.state ? (
            <>
              <Text style={styles.label}>City</Text>
              <Picker selectedValue={form.city} onValueChange={(val) => handleChange("city", val)}>
                <Picker.Item label="Select City" value=""  style={{ color: "black" }} />
                {data[form.country][form.state].map((ci) => (
                  <Picker.Item key={ci} label={ci} value={ci} />
                ))}
              </Picker>
            </>
          ) : null}

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={form.address}
            onChangeText={(t) => handleChange("address", t)}
            placeholder="Enter address"
          />

          {/* Fees */}
          <Text style={styles.label}>Fees</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.fees}
            onChangeText={(t) => handleChange("fees", t)}
            placeholder="Enter fees amount"
          />

          {/* Date Picker */}
          {form.fees !== "0" && (
            <>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{form.date || "Select Date"}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date ? new Date(form.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      handleChange("date", selectedDate.toISOString().split("T")[0]);
                    }
                  }}
                />
              )}
            </>
          )}

          {/* Payment Mode */}
          <Text style={styles.label}>Payment Mode *</Text>
          <View style={styles.radioGroup}>
            {["Cash", "UPI", "Cheque"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.radioOption}
                onPress={() => handleChange("payment", option)}
              >
                <View style={styles.radioCircle}>
                  {form.payment === option && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={submit}>
            <Text style={styles.submitText}>{editingStudent ? "Update" : "Submit"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StudentList({ navigation }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const onValueChange = database()
      .ref("/students")
      .on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudents(Object.values(data));
        } else {
          setStudents([]);
        }
      });

    return () => database().ref("/students").off("value", onValueChange);
  }, []);

  const deleteStudent = async (id) => {
    await database().ref(`/students/${id}`).remove();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Student List</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>Name: {item.name}</Text>
            <Text style={styles.cardText}>Mobile: {item.mobile}</Text>
            <Text style={styles.cardText}>Fees: {item.fees}</Text>
            <Text style={styles.cardText}>Payment: {item.payment}</Text>
            {item.city ? <Text style={styles.cardText}>City: {item.city}</Text> : null}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, marginRight: 5, backgroundColor: "orange" }]}
                onPress={() => navigation.navigate("StudentForm", { student: item })}
              >
                <Text style={styles.submitText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, marginLeft: 5, backgroundColor: "red" }]}
                onPress={() => deleteStudent(item.id)}
              >
                <Text style={styles.submitText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="StudentForm"
          component={StudentForm}
          options={{
            title: "Register Student",
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: "bold",
              color: "#2196F3",
            },
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#E3F2FD" },
          }}
        />
        <Stack.Screen name="StudentList" component={StudentList} options={{ title: "Student List" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
  },
  radioLabel: {
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  cardText: {
    fontSize: 14,
  },
});
