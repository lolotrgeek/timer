import React, { useState, useEffect, useRef } from 'react'
import { View, TextInput, Button, } from 'react-native'
import { nameValid, colorValid, projectValid } from '../constants/Validators'
import Messenger from '../constants/Messenger'
import { ColorPicker } from '../components/ColorPicker'
import { useAlert } from '../hooks/useAlert'
const debug = false

export default function ProjectCreate({ useHistory, useParams, styles }) {
  let history = useHistory()
  let { projectId } = useParams()
  const [name, setName] = useState('')
  const [color, setColor] = useState(styles.text.color)
  const [selected, setSelected] = useState(0)
  const alert = useAlert()

  useEffect(() => {
    if (projectId && typeof projectId === 'string') {
      console.log(projectId)
      Messenger.addListener(`${projectId}_details`, msg => {
        setName(msg.name)
        setColor(msg.color)
        setSelected(msg.selected)
      })
      Messenger.emit('ProjectDetails', projectId)
    }
    Messenger.addListener('alert', msg => {
      if (msg && msg.length > 0) alert.show(msg[1], { type: msg[0] })
    })

    Messenger.addListener('ProjectCreateSuccess', msg => {
      // if (projectValid(msg)) history.push(projectlink(msg.id))
      if (projectValid(msg)) history.goBack()
    })
    return () => {
      Messenger.removeAllListeners('alert')
      Messenger.removeAllListeners('ProjectCreateSuccess')
      if (projectId && typeof projectId === 'string') {
        Messenger.removeAllListeners(`${projectId}_details`)
      }
    }
  }, [])


  const handleSelectedColor = (color, swatch) => {
    debug && console.log(color)
    setColor(color)
    setSelected(swatch)
  }

  const submit = () => {
    if (projectId && typeof projectId === 'string') {
      Messenger.emit('ProjectEdit', { name, color, selected })
    } else {
      Messenger.emit('ProjectCreate', { name, color, selected })
    }
  }

  return (
    <View style={styles.containercenter}>
      <TextInput
        style={[{ color: color }, styles.input]}
        value={name}
        onChangeText={text => setName(text)}
        maxLength={30}
        placeholder='Project Title'
        placeholderTextColor='#999'
        underlineColorAndroid={styles.text.color}
      />
      <ColorPicker selectColor={handleSelectedColor} selected={selected} />
      <View>
        <Button style={styles.button} title='Submit' onPress={() => submit()} />
      </View>
    </View>
  )
}
