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
import ApiService, { ApiResponse } from '../../services/ApiService';
import Column from '../../components/atoms/Column';
import * as Icons from 'react-native-feather';
import Label from '../../components/atoms/Label';

const api = new ApiService();

function calculatePointPercentage(data: any) {
  const percentage =
    ((data.level.currentScore - data.level.currentLevel.minThreshold) /
      (data.level.nextLevel.minThreshold - data.level.currentLevel.minThreshold)) *
    100;
  return percentage + 1;
}

const RewardDisplay = ({
  reward,
  navigation
}: {
  reward: ApiResponse<typeof api.client.images.upload.$post, 200>;
  navigation: any;
}) => {
  const points = reward.points.reduce((sum, point) => sum + point.value, 0);
  const readableReason = {
    ['OFF_SCHEDULE']: 'being off schedule',
    ['ON_SCHEDULE']: 'being on schedule',
    ['STREAK_KEPT']: 'keeping your streak',
    ['SOCIAL']: 'being social'
  };
  const Icon = reward.badge ? Icons[reward.badge.icon as keyof typeof Icons] : Icons['Activity'];

  return (
    <Column
      styles={{
        flex: 1,
        paddingTop: 30,
        paddingVertical: 20,
        paddingHorizontal: 23,
        justifyContent: 'space-between'
      }}
    >
      <Column styles={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* POINTS */}
        <Text style={{ fontSize: 16 }}>You just earned</Text>
        <Text style={{ fontSize: 70 }}>{points}</Text>
        <Text style={{ fontSize: 16 }}>points!</Text>

        <Column styles={{ gap: 5, marginTop: 20 }}>
          {reward.points.map((point, id) => (
            <Row key={id} styles={{ backgroundColor: '#16a34a', padding: 8, borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>
                <Text style={{ fontWeight: 'bold' }}>{point.value} </Text> for {readableReason[point.reason]}
              </Text>
            </Row>
          ))}
        </Column>

        <Row styles={{ gap: 20 }}>
          {/* STREAK */}
          {reward.streak && (
            <Column styles={{ marginTop: 50 }}>
              <Text style={{ fontSize: 16 }}>Your current streak is</Text>
              <Text style={{ fontSize: 30, textAlign: 'center', marginVertical: 8 }}>{reward.streak.value}</Text>
              {reward.streak.reset && <Text>ℹ️ Streak has been reset</Text>}
            </Column>
          )}

          {/* BADGE */}
          {reward.badge && (
            <Column styles={{ marginTop: 50 }}>
              <Text style={{ fontSize: 16 }}>You've earned the badge</Text>
              <Column
                styles={{
                  gap: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0',
                  padding: 10,
                  borderRadius: 10,
                  borderColor: '#f0f0f0',
                  borderWidth: 1,
                  marginTop: 5
                }}
              >
                <Icon color={'black'} />
                <Label text={reward.badge.name} />
              </Column>
            </Column>
          )}
        </Row>

        {/* LEVEL */}
        <Row styles={{ justifyContent: 'space-between', width: '100%' }}>
          <Text style={{ fontSize: 16, marginTop: 70 }}>Your level is</Text>
          <Text style={{ fontSize: 16, marginTop: 70 }}>{reward.level.currentScore} points</Text>
        </Row>
        <Row
          styles={{
            alignItems: 'center',
            gap: 5,
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 20
          }}
        >
          <Row
            styles={{
              alignItems: 'center',
              gap: 5
            }}
          >
            <Text>
              {reward.level.currentLevel.name} ({reward.level.currentLevel.minThreshold})
            </Text>
          </Row>
          <Text>
            {reward.level.nextLevel.name} ({reward.level.nextLevel.minThreshold})
          </Text>
        </Row>
        <Column
          styles={{
            width: '100%',
            height: 5,
            marginTop: 5,
            backgroundColor: '#f0f0f0',
            borderRadius: 20,
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
        >
          <Column
            styles={{
              height: '100%',
              width: `${calculatePointPercentage(reward)}%`,
              backgroundColor: '#16a34a',
              borderRadius: 20
            }}
          />
        </Column>
      </Column>

      <MyButton accent smalltext text="Neat!" onPress={() => navigation.pop()} />
    </Column>
  );
};

export default function CameraScreen({ route, navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturingImage, setCapturingImage] = useState(true);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [pauseImageCapture, setPauseImageCapture] = useState(false);
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [reward, setReward] = useState<ApiResponse<typeof api.client.images.upload.$post, 200> | null>(null);

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
      const _reward = await repo.uploadImage(capturedPicture!.uri!, route.params.uuid);

      console.log('[CameraScreen] reward ', JSON.stringify(_reward, null, 2));
      setCapturingImage(false);
      setReward(_reward);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        textBody: 'Thing captured! ✨'
      });
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
      <View style={[styles.container, { justifyContent: 'center', gap: 20 }]}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <MyButton text={'Grant permission'} onPress={requestPermission} accent />
      </View>
    );
  }

  if (reward) {
    return <RewardDisplay reward={reward} navigation={navigation} />;
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
      <View style={{ marginBottom: 50, alignItems: 'center' }}>
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
