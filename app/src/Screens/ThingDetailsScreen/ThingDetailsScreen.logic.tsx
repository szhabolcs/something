import { useState } from "react";
import RespositoryService from "../../services/RespositoryService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useThingDetailsScreenLogic = () => {
  const [thing, setThing] = useState<{
    name: string;
    description: string;
    type: string;
    nextOccurrence?: {
      startTime: string;
      endTime: string;
    };
    sharedWith: {
      userUuid: string;
      username: string;
    }[];
    previousCheckpoints: {
      username: string;
      thingName: string;
      photoUuid: string;
    }[];
  } | null>(null);

  const getDetails = async (id: string) => {
    const repositoryService = new RespositoryService();

    const response = await repositoryService.thingRepository.getThingDetails<{
      name: string;
      description: string;
      type: string;
      nextOccurrence?: {
        startTime: string;
        endTime: string;
      };
      sharedWith: {
        userUuid: string;
        username: string;
      }[];
      previousCheckpoints: {
        username: string;
        thingName: string;
        photoUuid: string;
      }[];
    }>(id, (await AsyncStorage.getItem("token")) || "");

    setThing(response);
  };
  return {
    thing,
    getDetails,
  };
};
