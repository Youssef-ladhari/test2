import React from 'react';
import {View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
export default function QR_test() {
  return (
    <View>
      <QRCodeScanner onRead={data => console.log(data)} showMarker={true} />
    </View>
  );
}
