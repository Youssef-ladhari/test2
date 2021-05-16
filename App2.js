import React, {Component} from 'react';
import axios from 'axios';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  Dimensions,
} from 'react-native';

import MapView from 'react-native-maps';
const PATH = 'https://api.jsonbin.io/b/605fbf61050d147e2b2ef968';
const Images = [
  {uri: 'https://i.imgur.com/sNam9iJ.jpg'},
  {uri: 'https://i.imgur.com/N7rlQYt.jpg'},
  {uri: 'https://i.imgur.com/UDrH0wm.jpg'},
  {uri: 'https://i.imgur.com/Ka8kNST.jpg'},
];

const {width, height} = Dimensions.get('window');

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

const plop = async () => {
  let final = [];

  await axios.get(PATH).then(res => {
    let pre;
    res.data.markers.map(marker => {
      pre = {
        coordinate: {
          latitude: marker.coordinate.latitude,
          longitude: marker.coordinate.longitude,
        },
        title: marker.title,
        description: marker.description,
        image: marker.image,
      };
      console.log('pre VAlue !!' + JSON.stringify(pre));
      final.push(JSON.stringify(pre));
    });
  });
  console.log('Final Value !!' + final);
  return JSON.stringify(final);

  // res.data.markers.map((marker, index) => {
  //   console.log('INDEX : ' + index);
  //   console.log('MARKER : ' + marker.coordinate.latitude);
  //   title = title + marker.title;
  // });
  // setTest(title);
};

export default class screens extends Component {
  async getdata() {
    let final = [];

    await axios.get(PATH).then(res => {
      let pre;
      res.data.markers.map(marker => {
        pre = {
          coordinate: {
            latitude: marker.coordinate.latitude,
            longitude: marker.coordinate.longitude,
          },
          title: marker.title,
          description: marker.description,
          image: marker.image,
        };
        console.log('pre VAlue !!' + JSON.stringify(pre));
      });
    });
    console.log('Final Value !!' + final);
    this.state.data(true);
    return JSON.stringify(final);
  }
  state = {
    data: false,
    markers: this.getdata(),
    region: {
      latitude: 45.52220671242907,
      longitude: -122.6653281029795,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  };

  componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0);
  }
  componentDidMount() {
    // We should detect when scrolling has stopped then animate
    // We should just debounce the event listener here
    if (plop != null) {
      this.animation.addListener(({value}) => {
        let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
        if (index >= this.state.markers.length) {
          index = this.state.markers.length - 1;
        }
        if (index <= 0) {
          index = 0;
        }

        clearTimeout(this.regionTimeout);
        this.regionTimeout = setTimeout(() => {
          if (this.index !== index) {
            this.index = index;
            const {coordinate} = this.state.markers[index];
            this.map.animateToRegion(
              {
                ...coordinate,
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta,
              },
              350,
            );
          }
        }, 10);
      });
    } else {
    }
  }
  render() {
    console.log('STATE MARKERS Value !!' + this.state.markers);
    const interpolations = this.state.markers.map((marker, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 2.5, 1],
        extrapolate: 'clamp',
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: 'clamp',
      });
      return {scale, opacity};
    });
    return (
      <View style={styles.container}>
        <MapView
          ref={map => (this.map = map)}
          initialRegion={this.state.region}
          style={styles.container}>
          {this.state.markers.map((marker, index) => {
            const scaleStyle = {
              transform: [
                {
                  scale: interpolations[index].scale,
                },
              ],
            };
            const opacityStyle = {
              opacity: interpolations[index].opacity,
            };
            return (
              <MapView.Marker key={index} coordinate={marker.coordinate}>
                <Animated.View style={[opacityStyle]}>
                  <Animated.View style={[scaleStyle]} />
                  <View style={styles.marker} />
                </Animated.View>
              </MapView.Marker>
            );
          })}
        </MapView>
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: this.animation,
                  },
                },
              },
            ],
            {useNativeDriver: true},
          )}
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}>
          {this.state.markers.map((marker, index) => (
            <View style={styles.card} key={index}>
              <Image
                source={marker.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.textContent}>
                <Text numberOfLines={1} style={styles.cardtitle}>
                  {marker.title}
                </Text>
                <Text numberOfLines={1} style={styles.cardDescription}>
                  {marker.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH,
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: {x: 2, y: -2},
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 3,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  textContent: {
    flex: 1,
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 12,
    color: '#444',
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(130,4,150, 0.9)',
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(130,4,150, 0.3)',
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(130,4,150, 0.5)',
  },
});
