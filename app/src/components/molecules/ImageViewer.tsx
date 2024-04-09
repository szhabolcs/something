import { ImageBackground, StyleSheet, Text, View } from "react-native";
import React from "react";
import Column from "../atoms/Column";
import H2 from "../atoms/H2";
import H4 from "../atoms/H4";

type ImageViewerProps = {
  uri: string;
  name: string;
  username: string;
};

const ImageViewer = ({ uri, name, username }: ImageViewerProps) => {
  return (
    <Column
      styles={{
        backgroundColor: "#f5f5f5",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <ImageBackground
        source={{
          uri,
        }}
        style={{
          width: "100%",
          aspectRatio: 1,
        }}
      />
      <H2 cursive>{name}</H2>
      <H4 cursive accent>
        {username}
      </H4>
    </Column>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({});
