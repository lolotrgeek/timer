import React, { useState } from 'react';
import { dateSimple, simpleDate, timeString } from '../constants/Functions'

import { Text, TouchableOpacity, View, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const debug = false

export function PickerDate(props) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center'  }} >
        {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
      <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.previousDay} /></View>
      <View style={{ width: 100, margin: 20, alignItems:'center' }}>
        <TouchableOpacity onPress={() => setShow(true)} >
          <Text>{dateSimple(props.startdate)}</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          mode='date'
          value={props.startdate}
          onChange={(event, newDate) => { setShow(false); props.onDateChange(newDate); }}
        />)}

      <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.nextDay} /></View>

    </View>
  );
}
export function PickerTime(props) {
  const [show, setShow] = useState(false);
  debug && console.log(props.show)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} >
        {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
      <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.subtractMinutes} /></View>
      <View style={{ width: 100, margin: 20, alignItems: 'center' }}>
        {props.running && props.running.status === 'running' ?
          <Text>Tracking...</Text> :
          <TouchableOpacity onPress={() => setShow(true)} >
            <Text>{timeString(props.time)}</Text>
          </TouchableOpacity>
        }
      </View>
      {show && (
        <DateTimePicker
          mode='time'
          value={props.time}
          onChange={(event, newTime) => { setShow(false); props.onTimeChange(newTime); }}
        />)}
      <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.addMinutes} /></View>

    </View>


  );
}