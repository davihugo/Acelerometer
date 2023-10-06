import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [data, setData] = useState({});
  const [smoothedData, setSmoothedData] = useState({});
  const [distance, setDistance] = useState(0);
  const [prevData, setPrevData] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const filterFactor = 0.2;

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (isMeasuring && prevData) {
        // Aplicar suavização (filtro passa-baixa) aos dados do acelerômetro
        const smoothedX = x * filterFactor + (1 - filterFactor) * (smoothedData.x || x);
        const smoothedY = y * filterFactor + (1 - filterFactor) * (smoothedData.y || y);
        const smoothedZ = z * filterFactor + (1 - filterFactor) * (smoothedData.z || z);

        // Calcular a aceleração total
        const acceleration = Math.sqrt(smoothedX * smoothedX + smoothedY * smoothedY + smoothedZ * smoothedZ);

        // Calcular o intervalo de tempo entre as leituras do acelerômetro
        const deltaTime = 0.1; // Substitua por um valor adequado de acordo com a taxa de amostragem

        // Calcular a velocidade usando a integração numérica
        const velocity = acceleration * deltaTime;

        // Calcular a distância usando a integração numérica
        const newDistance = distance + velocity * deltaTime;
        setDistance(newDistance);
        setSmoothedData({ x: smoothedX, y: smoothedY, z: smoothedZ });
      }

      setData({ x, y, z });
      setPrevData({ x, y, z });
    });

    return () => {
      subscription.remove();
    };
  }, [distance, prevData, isMeasuring, smoothedData]);

  const startMeasurement = () => {
    setDistance(0);
    setIsMeasuring(true);
  };

  const stopMeasurement = () => {
    setIsMeasuring(false);
  };

  return (
    <View style={styles.container}>
      <Text>X: {data.x}</Text>
      <Text>Y: {data.y}</Text>
      <Text>Z: {data.z}</Text>
      <Text>Distância percorrida: {distance.toFixed(2)} metros</Text>
      {isMeasuring ? (
        <Button title="Parar Medição" onPress={stopMeasurement} />
      ) : (
        <Button title="Iniciar Medição" onPress={startMeasurement} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});