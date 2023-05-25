import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";

import MAPBOX_STYLE from "./utils/constants";
import haversine from "haversine";
import { tisdallParkTrailCoordinates } from "./db/trailCoords";

export default function App() {
  const [region, setRegion] = useState(null);
  const [moveData, setMoveData] = useState({
    kcal: 0,
    distanceTravelled: 0,
    routeCoordinates: [],
    prevCoordinate: {},
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        watchUserLocation();
      } else {
        setErrorMsg("Permission to access location was denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const calcDistance = (prevCoordinate, newCoordinate) => {
    return haversine(prevCoordinate, newCoordinate) || 0;
  };

  const calcKcal = (distanceDelta) => {
    // Calculated as 7kcal per 0.1m
    return (distanceDelta / 0.1) * 7;
  };

  const watchUserLocation = () => {
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300,
        distanceInterval: 1,
      },
      (position) => {
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude,
        };
        setRegion({ latitude, longitude });
        setMoveData((prevMoveData) => ({
          kcal: calcKcal(
            prevMoveData.distanceTravelled +
              calcDistance(prevMoveData.prevCoordinate, newCoordinate)
          ),
          distanceTravelled:
            prevMoveData.distanceTravelled +
            calcDistance(prevMoveData.prevCoordinate, newCoordinate),
          routeCoordinates: [...prevMoveData.routeCoordinates, newCoordinate],
          prevCoordinate: newCoordinate,
        }));
      }
    );
  };

  return (
    <Fragment>
      {region && (
        <View style={styles.container}>
          <MapView
            style={styles.map}
            provider={MapView.PROVIDER_MAPBOX}
            customMapStyle={MAPBOX_STYLE}
            zoomEnabled={true}
            showsUserLocation={true}
            initialRegion={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Polyline
              coordinates={moveData.routeCoordinates}
              strokeWidth={6}
              strokeColor="#FF0"
            />
            <Polyline
              coordinates={tisdallParkTrailCoordinates}
              strokeColor="#B24112"
              strokeWidth={6}
            />
          </MapView>
          <View style={{ position: "absolute", top: 80, left: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              {`Distance(Km): ${moveData.distanceTravelled.toFixed(3)}`}
            </Text>
          </View>
          <View style={{ position: "absolute", top: 140, left: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              {`Cal(Kcal): ${moveData.kcal.toFixed(3)}`}
            </Text>
          </View>
        </View>
      )}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
