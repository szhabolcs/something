import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import H1 from '../../components/atoms/H1';
import H3 from '../../components/atoms/H3';
import Row from '../../components/atoms/Row';
import { RefreshCcw, Send } from 'react-native-feather';
import CameraRepository from '../../repositories/camera/CameraRepository';
import { manipulateAsync, FlipType } from 'expo-image-manipulator';
import MyButton from '../../components/molecules/MyButton';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

export default function CameraScreen({ route, navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturingImage, setCapturingImage] = useState(true);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [pauseImageCapture, setPauseImageCapture] = useState(false);
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);

  const { height, width } = Dimensions.get('window');
  const cameraWidth = 300;
  const cameraHeight = 400;
  const widthOffset = width / 2 - cameraWidth / 2;
  const cameraTopOffset = height / 2 - cameraHeight / 2 - 100;

  const cameraRef = useRef<CameraView | null>(null);

  const toggleCameraType = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const captureImage = async () => {
    if (!cameraRef?.current) {
      return;
    }

    let photo = await cameraRef.current.takePictureAsync();

    if (!photo) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        textBody: 'Failed to take picture. Please try again.'
      });
      return;
    }

    if (facing === 'front') {
      photo = await manipulateAsync(photo.uri, [{ flip: FlipType.Horizontal }]);
    }

    setPauseImageCapture(true);
    setCapturingImage(false);
    setCapturedPicture(photo);
  };

  const retakeImage = () => {
    setPauseImageCapture(false);
    setCapturedPicture(null);
  };

  const sendImage = async () => {
    if (capturingImage) {
      return;
    }

    setCapturingImage(true);

    try {
      setPauseImageCapture(true);
      const repo = new CameraRepository();
      // Throws error
      const rewards = await repo.uploadImage(capturedPicture!.uri!, route.params.uuid);

      console.log('[CameraScreen] rewards ', JSON.stringify(rewards, null, 2));
      setCapturingImage(false);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        textBody: 'Thing captured! ✨'
      });

      navigation.navigate('Home');
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        textBody: 'Failed to send picture. Please try again.'
      });
      setCapturingImage(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <MyButton text={'Grant permission'} onPress={requestPermission} accent />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedPicture && (
        <CameraView
          onCameraReady={() => setCapturingImage(false)}
          ref={cameraRef}
          facing={facing}
          mode="picture"
          animateShutter={false}
          style={[
            styles.camera,
            {
              left: widthOffset,
              right: widthOffset,
              top: cameraTopOffset,
              width: cameraWidth,
              height: cameraHeight
            }
          ]}
        />
      )}

      {capturedPicture && (
        <Image
          source={{ uri: capturedPicture.uri }}
          style={[
            styles.camera,
            {
              left: widthOffset,
              right: widthOffset,
              top: cameraTopOffset,
              width: cameraWidth,
              height: cameraHeight,
              resizeMode: 'contain',
              backgroundColor: '#a5d1b5',
              borderRadius: 5
            }
          ]}
        />
      )}

      <Row>
        {!capturingImage && !pauseImageCapture && <TouchableOpacity style={styles.shutter} onPress={captureImage} />}
        {capturingImage && <ActivityIndicator size="large" />}
        {!capturingImage && !pauseImageCapture && (
          <TouchableOpacity style={styles.change} onPress={toggleCameraType}>
            <RefreshCcw color={'black'} />
          </TouchableOpacity>
        )}
        {pauseImageCapture && !capturingImage && (
          <TouchableOpacity style={styles.retake} onPress={retakeImage}>
            <Text>Retake</Text>
            <RefreshCcw color={'black'} />
          </TouchableOpacity>
        )}
        {pauseImageCapture && !capturingImage && (
          <TouchableOpacity style={styles.send} onPress={sendImage}>
            <Text>Send</Text>
            <Send color={'black'} />
          </TouchableOpacity>
        )}
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  camera: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 50
  },
  button: {
    marginTop: 20
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 100,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    marginRight: 20,
    marginLeft: 50
  },
  send: {
    width: 100,
    height: 50,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    marginRight: 20
  },
  retake: {
    width: 100,
    height: 50,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    marginRight: 20,
    marginLeft: 20
  },
  change: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  }
});
