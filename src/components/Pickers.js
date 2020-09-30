import React, { useState } from 'react';
import 'date-fns';
import MomentUtils from '@date-io/moment'
import { View, Button, TouchableOpacity } from 'react-native';
import Text from './Text'
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from '@material-ui/pickers';
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { dateSimple, simpleDate, timeString } from '../constants/Functions'

const materialTheme = createMuiTheme({
  overrides: {
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: 'grey',
        maxWidth: 'auto'

      },
      toolbarLandscape: {
        maxWidth: 'auto'
      }
    },
    MuiPickersBasePicker: {
      pickerView: {
        maxWidth: 'auto'
      }
    },
    MuiPickersDay: {
      day: {
        color: 'grey',
      },
      daySelected: {
        backgroundColor: 'grey',
      },
      dayDisabled: {
        color: 'grey',
      },
      current: {
        color: 'grey',
      },
    },
    MuiPickersModal: {
      dialogAction: {
        color: 'grey',
      },
    },
  },
})

export function PickerDate(props) {
  // console.log(props.styles)
  const [show, setShow] = useState(false);
  return (
    <ThemeProvider theme={materialTheme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
          <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.previousDay} /></View>
          <View style={{ width: 100, margin: 20 }}>

            <DatePicker
              margin="normal"
              id="date-picker-dialog"
              // format="MM-DD-YYYY"
              orientation='portrait'
              value={props.startdate}
              open={show}
              onOpen={() => setShow(true)}
              onClose={() => setShow(false)}
              disableFuture={true}
              onChange={date => props.onDateChange(date)}
              maxDate={props.maxDate}
              TextFieldComponent={() => (
                <TouchableOpacity onPress={() => setShow(true)} >
                  <Text>{dateSimple(props.startdate)}</Text>
                </TouchableOpacity>
              )}

            />
          </View>
          <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.nextDay} /></View>
        </View>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
}
export function PickerTime(props) {
  const [show, setShow] = useState(false);
  return (
    <ThemeProvider theme={materialTheme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {props.label ? <View style={{ width: 50, margin: 20 }}><Text>{props.label}</Text></View> : <View></View>}
          <View style={{ width: 30, margin: 20 }}><Button title='<' onPress={props.subtractMinutes} /></View>
          <View style={{ width: 100, margin: 20 }}>
            {props.running && props.running.status === 'running' ?
              <Text>Tracking...</Text>
              :
              <TimePicker
                open={show}
                onOpen={() => setShow(true)}
                onClose={() => setShow(false)}
                views={['hours', 'minutes', 'seconds']}
                opento='hours'
                orientation='portrait'
                value={props.time}
                onChange={date => props.onTimeChange(date)}
                // onAccept={props.onTimeChange}
                // format="HH:mm:ss a"
                ampm={true}
                TextFieldComponent={() => (
                  <TouchableOpacity onPress={() => setShow(true)} >
                    <Text>{timeString(props.time)}</Text>
                  </TouchableOpacity>
                )}
              />
            }
          </View>
          <View style={{ width: 30, margin: 20 }}><Button title='>' onPress={props.addMinutes} /></View>
        </View>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
}
