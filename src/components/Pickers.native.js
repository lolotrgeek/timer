import React, { useState } from 'react';
import { dateSimple, simpleDate, timeString } from '../constants/Functions'

import { Text, TouchableOpacity, View, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const debug = false

export function PickerDate(props) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ flexDirection: 'row' }} >

      <Text>{props.label}</Text>
      <Button title='<' onPress={props.previousDay} />
      <TouchableOpacity onPress={() => setShow(true)} >
        <Text>{dateSimple(props.startdate)}</Text>
      </TouchableOpacity>
      
      {show && (
        <DateTimePicker
          mode='date'
          value={props.startdate}
          onChange={(event, newDate) => { setShow(false); props.onDateChange(newDate); }}
        />)}

      <Button title='>' onPress={props.nextDay} />

    </View>
  );
}
export function PickerTime(props) {
  const [show, setShow] = useState(false);
  debug && console.log(props.show)
  return (
    <View style={{ flexDirection: 'row' }} >

      <Text>{props.label}</Text>

      <Button title='<' onPress={props.subtractMinutes} />

      {props.running && props.running.status === 'running' ?
        <Text>Tracking...</Text> :
        <TouchableOpacity onPress={() => setShow(true)} >
          <Text>{timeString(props.time)}</Text>
        </TouchableOpacity>
      }
      {show && (
        <DateTimePicker
          mode='time'
          value={props.time}
          onChange={(event, newTime) => { setShow(false); props.onTimeChange(newTime); }}
        />)}

      <Button title='>' onPress={props.addMinutes} />
    </View>


  );
}