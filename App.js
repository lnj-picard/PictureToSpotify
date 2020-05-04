import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator
} from "react-native";
import { Permissions, ImagePicker, Camera } from "expo";
import Clarifai from "clarifai";
const Buffer = require("buffer/").Buffer;

const clarifaiAPI = new Clarifai.App({
  apiKey: "da6644d2840146a592f1241091db008a"
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      permission: null,
      image: null,
      loading: false,
      camera: false
    };
  }

  allowPicture = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    //this.getSnapshotBeforeUpdate({ permission: status });

    this.setState({ permission: status });

    if (status === "granted") this.getPictures();
  };

  getPictures = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.cancelled) {
      this.setState(
        {
          image: result.url,
          loading: true,
          loadingText: "Sending picture to the AI"
        },
        () => {
          this.analyzePicture();
        }
      );
    }
  };

  analyzePicture = async () => {
    clarifaiAPI.models
      .predict(
        Clarifai.GENERAL_MODEL,
        "https://samples.clarifai.com/metro-north.jpg"
      )
      .then(response => {
        const imgKeys = [];
        response.outputs[0].data.concepts.forEach(({ name }) => {
          if (imgKeys.length < 3) imgKeys.push(name);
        });
        alert(imgKeys);
        this.connectToSpotify();
        //alert("Respdfjsd: " + JSON.stringify(response.outputs[0].data.concepts));
      })
      .catch(err => {
        alert("Errorzfcz: " + JSON.stringify(err));
      });
  };

  connectToSpotify = () => {
    var client_id = "4be2414b50d647e7a2026f8d329bed2d";
    var client_secret = "710bf5e0552b4f6b9869896a3229c397";

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic" +
          new Buffer(client_id + ":" + client_secret).toString("base64")
      },
      body: JSON.stringify({ grant_type: "Client_credentials" })
    })
      .then(response => response.json())
      .then(data => alert(JSON.stringify(data)));
  };

  handleCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      camera: true
    });
  };

  closeCamera = () => {
    this.setState({ camera: false });
  };
  render() {
    return (
      <View style={styles.container}>
        {this.state.camera === true ? (
          <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back}>
            <Button title="Close camera" onPress={this.closeCamera} />
          </Camera>
        ) : this.state.loading === true ? (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text> {this.state.loadingText} </Text>
          </>
        ) : (
          <>
            <Button title="Choose a picture" onPress={this.allowPicture} />
            <Button title="Open camera" onPress={this.handleCamera} />
            {this.state.image !== null && <Text>{this.state.image}</Text>}
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccc",
    alignItems: "stretch",
    justifyContent: "center"
  }
});
