import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";

import MAPBOX_STYLE from "./utils/constants";
import { tisdallParkTrailCoordinates } from "./db/trailCoords";

export default function App() {
  const [region, setRegion] = useState(null);
  const [userPath, setUserPath] = useState([]);

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
        // update coordinate
        setRegion({ latitude, longitude });
        setUserPath((prevPath) => [...prevPath, newCoordinate]);
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
              coordinates={userPath}
              strokeWidth={6}
              strokeColor="#00F"
            />
            <Polyline
              coordinates={tisdallParkTrailCoordinates}
              strokeColor="#B24112"
              strokeWidth={6}
            />
          </MapView>
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
