import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseRepository from '../BaseRepository';

export default class CameraRepository extends BaseRepository {
  async uploadImage(image: any, uuid: string) {
    const body = new FormData();
    // @ts-ignore
    body.append('image', {
      uri: image,
      name: 'image',
      type: 'image/jpg'
    });
    body.append('thing_uuid', uuid);

    await this.api.postFormData('image-upload', {
      body,
      token: (await AsyncStorage.getItem('token')) || ''
    });
  }
}
