import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
} from "react-native";
import H1 from "../../components/atoms/H1";
import H3 from "../../components/atoms/H3";
import Row from "../../components/atoms/Row";
import { RefreshCcw } from "react-native-feather";
import CameraRepository from "../../repositories/camera/CameraRepository";

export default function CameraScreen({ route, navigation }: any) {
  const [hasPermission, setHasPermission] = useState(false);
  const [capturingImage, setCapturingImage] = useState(false);
  const [type, setType] = useState(CameraType.front);
  const [picture, setPicture] = useState<string>();

  const { height, width } = Dimensions.get("window");
  const cameraWidth = 300;
  const cameraHeight = 400;
  const widthOffset = width / 2 - cameraWidth / 2;
  const cameraTopOffset = height / 2 - cameraHeight / 2 - 100;

  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const captureImage = async () => {
    if (capturingImage) return;

    if (cameraRef.current) {
      setCapturingImage(true);

      try {
        const { base64, uri } = await cameraRef.current.takePictureAsync({
          base64: true,
        });

        const repo = new CameraRepository();
        await repo.uploadImage(uri!, route.params.uuid);
        navigation.navigate("Home");
        
        console.log("Captured image as base64");
        setCapturingImage(false);
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <Text>
        No access to camera. Please provide access in the phone's settings, and
        try again.
      </Text>
    );
  }

  const handleFinish = async () => {
    console.log("Sending pictures to server");
    // await fetchData('student/face-features', 'POST', {}, pictures);
    // route.replace('/specialization');
  };

  const cameraReady = async () => {
    console.log(await cameraRef.current?.getSupportedRatiosAsync());
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        type={type}
        onCameraReady={cameraReady}
        style={[
          styles.camera,
          {
            left: widthOffset,
            right: widthOffset,
            top: cameraTopOffset,
            width: cameraWidth,
            height: cameraHeight,
          },
        ]}
      ></Camera>
      <Row>
        <TouchableOpacity
          style={styles.shutter}
          onPress={captureImage}
        ></TouchableOpacity>
        <TouchableOpacity style={styles.change} onPress={toggleCameraType}>
          <RefreshCcw color={"black"} />
        </TouchableOpacity>
      </Row>
      <View style={{ marginBottom: 50 }}>
        <H3>
          Current <H3 accent>Thing</H3> being captured
        </H3>
        <H1>{route.params.name}</H1>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  camera: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 50,
  },
  button: {
    marginTop: 20,
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 100,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
    marginRight: 20,
    marginLeft: 50,
  },
  change: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});
