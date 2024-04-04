import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { authSelector, loginSilently } from "../redux/auth/AuthSlice";

export const useRootNavigationLogic = () => {
  const userState = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const signInSilently = () => {
    dispatch(loginSilently());
  };

  return {
    loading: userState.loading,
    user: userState.user,
    signInSilently,
  };
};
