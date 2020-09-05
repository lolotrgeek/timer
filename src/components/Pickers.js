import React from 'react';
import 'date-fns';
import MomentUtils from '@date-io/moment'
import { View, Button, Text } from 'react-native';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from '@material-ui/pickers';

export function PickerDate(props) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <View style={{ flexDirection: 'row' }}>
        <Text>{props.label}</Text>
        <Button title='<' onPress={props.previousDay} />
        <DatePicker
          margin="normal"
          id="date-picker-dialog"
          format="MM/dd/yyyy"
          value={props.startdate}
          disableFuture={true}
          onChange={props.onDateChange}
          maxDate={props.maxDate}

        />
        <Button title='>' onPress={props.nextDay} />
      </View>
    </MuiPickersUtilsProvider>
  );
}
export function PickerTime(props) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <View style={{ flexDirection: 'row' }}>
        <Text>{props.label}</Text>
        <Button title='<' onPress={props.subtractMinutes} />
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
            onChange={props.onTimeChange}
            // onAccept={props.onTimeChange}
            format="HH:mm:ss a"
            ampm={true}
            style={{ cursor: 'pointer' }}

          />
        }
        <Button title='>' onPress={props.addMinutes} />
      </View>
    </MuiPickersUtilsProvider>
  );
}
