import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline } from "react-native-maps";

import MAPBOX_STYLE from "./utils/constants";
import { tisdallParkTrailCoordinates } from "./db/trailCoords";

export default function App() {
  const [location, setLocation] = useState(null);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let curLocation = await Location.getCurrentPositionAsync({});
      setLocation(curLocation);
    })();
  }, []);
  return (
    <Fragment>
      {location ? (
        <View style={styles.container}>
          <MapView
            style={styles.map}
            provider={MapView.PROVIDER_MAPBOX}
            customMapStyle={MAPBOX_STYLE}
            zoomEnabled={true}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Polyline
              coordinates={tisdallParkTrailCoordinates}
              strokeColor="#B24112"
              strokeWidth={6}
            />
          </MapView>
        </View>
      ) : null}
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
