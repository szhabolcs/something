import { useState } from "react";
import { useAppDispatch } from "../../hooks/hooks";
import { login } from "../../redux/auth/AuthSlice";

export const useLoginScreenLogic = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    if (username === "" || password === "") {
      return;
    }
    dispatch(
      login({
        username,
        password,
      })
    );
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
  };
};
