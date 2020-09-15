import React from 'react';
import 'date-fns';
import MomentUtils from '@date-io/moment'
import { View, Button, Text } from 'react-native';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from '@material-ui/pickers';

export function PickerDate(props) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <View style={{ flexDirection: 'row', alignItems: 'center'  }}>
      {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
        <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.previousDay} /></View>
        <View style={{ width: 100, margin: 20 }}>
          <DatePicker
            margin="normal"
            id="date-picker-dialog"
            format="MM-DD-YYYY"
            value={props.startdate}
            disableFuture={true}
            onChange={date => props.onDateChange(date)}
            maxDate={props.maxDate}

          />
        </View>
        <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.nextDay} /></View>
      </View>
    </MuiPickersUtilsProvider>
  );
}
export function PickerTime(props) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <View style={{ flexDirection: 'row', alignItems: 'center'  }}>
        {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
        <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.subtractMinutes} /></View>
        <View style={{ width: 100, margin: 20 }}>
          {props.running && props.running.status === 'running' ?
            <TimePicker
              inputValue='tracking'
              disabled='true'
              invalidDateMessage=''
              format="HH:mm:ss a"
              style={{ cursor: 'pointer' }}
            />
            :
            <TimePicker
              margin="normal"
              views={['hours', 'minutes', 'seconds']}
              opento='hours'
              value={props.time}
              onChange={date => props.onTimeChange(date)}
              // onAccept={props.onTimeChange}
              format="HH:mm:ss a"
              ampm={true}
              style={{ cursor: 'pointer' }}

            />
          }
        </View>
        <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.addMinutes} /></View>
      </View>
    </MuiPickersUtilsProvider>
  );
}
