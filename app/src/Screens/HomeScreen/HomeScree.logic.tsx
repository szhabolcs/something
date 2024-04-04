import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  getAllTodaysPersonalThings,
  getOtherThingsToday,
  getTodaysPersonalThingsPreview,
  thingSelector,
} from "../../redux/thing/ThingStack";

export const useHomeScreenLogic = () => {
  const dispatch = useAppDispatch();

  const thingState = useAppSelector(thingSelector);

  const { personalThings, otherThings, loading } = thingState;

  const todaysPersonalThings = personalThings.today.preview;
  const allTodaysPersonalThings = personalThings.today.all;

  const todaysOtherThings = otherThings.today;

  const getTodaysThingsPreview = () => {
    dispatch(getTodaysPersonalThingsPreview());
  };

  const getTodaysOtherThings = () => {
    dispatch(getOtherThingsToday());
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
  };
};
