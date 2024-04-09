import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../redux/auth/AuthSlice";
import {
  getAllTodaysPersonalThings,
  getOtherThingsToday,
  getTodaysPersonalThingsPreview,
  thingSelector,
} from "../../redux/thing/ThingStack";

export const useHomeScreenLogic = () => {
  const [refreshing, setRefreshing] = useState(true);

  const dispatch = useAppDispatch();

  const thingState = useAppSelector(thingSelector);

  const { personalThings, otherThings, loading } = thingState;

  const todaysPersonalThings = personalThings.today.preview;
  const allTodaysPersonalThings = personalThings.today.all;

  const todaysOtherThings = otherThings.today;

  const getTodaysThingsPreview = async () => {
    try {
      await dispatch(getTodaysPersonalThingsPreview());
    } catch (error) {
      console.log("Dispatch error: ", error);
      dispatch(logout());
    }
  };

  const getTodaysOtherThings = async () => {
    await dispatch(getOtherThingsToday());
  };

  const getHomeThings = async () => {
    setRefreshing(true);
    await getTodaysThingsPreview();
    await getTodaysOtherThings();
    setRefreshing(false);
  };

  const getAllPersonalThings = () => {
    dispatch(getAllTodaysPersonalThings());
  };

  return {
    todaysPersonalThings,
    todaysOtherThings,
    allTodaysPersonalThings,
    getTodaysThingsPreview,
    getTodaysOtherThings,
    loading,
    refreshing,
    getHomeThings
  };
};
