import { ImageBackground, StyleSheet, Text, View } from "react-native";
import React from "react";
import Column from "../atoms/Column";
import H3 from "../atoms/H3";
import H4 from "../atoms/H4";
import { LinearGradient } from "expo-linear-gradient";

type OtherThingCardProps = {
  image: string;
  name: string;
  username: string;
};

const OtherThingCard = ({ image, name, username }: OtherThingCardProps) => {
  // TODO: Change the source of the image
  const imageLink = {
    uri: image,
  };
  return (
    <ImageBackground
      style={{
        height: 300,
        marginVertical: 8,
        marginHorizontal: 16,
      }}
      imageStyle={{ borderRadius: 8 }}
      source={imageLink}
    >
      <LinearGradient
        colors={["#21212100", "#212121"]}
        style={{ height: "100%", width: "100%", borderRadius: 8 }}
      >
        <Column
          styles={{
            height: "100%",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <H4 accent>@{username}</H4>
          <H3 white>{name}</H3>
        </Column>
      </LinearGradient>
    </ImageBackground>
  );
};

export default OtherThingCard;

const styles = StyleSheet.create({});
