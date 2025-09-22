import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export default function App() {
  // State สำหรับเก็บสถานะว่าอุปกรณ์รองรับ Biometrics หรือไม่
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  // State สำหรับเก็บสถานะว่ามีการลงทะเบียน Biometrics ไว้ในเครื่องหรือไม่
  const [isEnrolled, setIsEnrolled] = useState(false);
  // State สำหรับเก็บสถานะการยืนยันตัวตน
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect จะทำงานเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    // ฟังก์ชันตรวจสอบคุณสมบัติ Biometric ของอุปกรณ์
    (async () => {
      // 1. ตรวจสอบว่าอุปกรณ์มีฮาร์ดแวร์รองรับ Biometrics หรือไม่
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(hasHardware);

      // 2. ตรวจสอบว่ามีการลงทะเบียนลายนิ้วมือหรือใบหน้าไว้ในเครื่องหรือไม่
      if (hasHardware) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);
      }
    })();
  }, []);

  // ฟังก์ชันสำหรับการเรียกใช้หน้าต่างยืนยันตัวตน
  const handleBiometricAuth = async () => {
    // ตรวจสอบขั้นแรก: หากไม่รองรับฮาร์ดแวร์ หรือไม่มีการลงทะเบียน
    if (!isBiometricSupported || !isEnrolled) {
      Alert.alert(
        "การยืนยันตัวตน",
        "อุปกรณ์ไม่รองรับ Biometrics หรือยังไม่ได้ลงทะเบียนลายนิ้วมือ/ใบหน้า"
      );
      return;
    }

    try {
      // เรียกใช้เมธอด authenticateAsync()
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "โปรดยืนยันตัวตนเพื่อเข้าสู่ระบบ", // ข้อความที่แสดงใน Prompt
        // 'disableDeviceFallback: true' เพื่อป้องกันการกลับไปใช้รหัสผ่านเครื่อง
      });

      if (result.success) {
        setIsAuthenticated(true);
        Alert.alert("สำเร็จ", "ยืนยันตัวตนสำเร็จ!");
      } else {
        setIsAuthenticated(false);
        // แสดงข้อความแจ้งเตือนตามข้อผิดพลาดที่ได้รับ (เช่น ผู้ใช้กดยกเลิก)
        Alert.alert("ล้มเหลว", `การยืนยันตัวตนล้มเหลว: ${result.error}`);
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการยืนยันตัวตน");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Biometric Authentication Example</Text>

      {/* แสดงสถานะการรองรับและลงทะเบียน */}
      <Text>
        รองรับ Biometric Hardware: {isBiometricSupported ? "ใช่" : "ไม่"}
      </Text>
      <Text>มีการลงทะเบียน Biometric: {isEnrolled ? "ใช่" : "ไม่"}</Text>

      <View style={styles.spacer} />

      {/* ปุ่มสำหรับเรียกใช้การยืนยันตัวตน */}
      <Button
        title="ยืนยันตัวตนด้วย Biometrics"
        onPress={handleBiometricAuth}
        disabled={!isBiometricSupported || !isEnrolled}
      />

      <View style={styles.spacer} />

      {/* แสดงผลลัพธ์การยืนยันตัวตน */}
      {isAuthenticated ? (
        <Text style={styles.successText}>🔒 เข้าสู่ระบบสำเร็จแล้ว</Text>
      ) : (
        <Text style={styles.failText}>🔓 ยังไม่ได้เข้าสู่ระบบ</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
  successText: {
    marginTop: 20,
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
  },
  failText: {
    marginTop: 20,
    color: "red",
    fontSize: 16,
  },
});
