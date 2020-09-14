import React, { useState, useEffect, useRef } from 'react'
import { View, TextInput, Text, Button, StyleSheet, } from 'react-native'
import { nameValid, colorValid, projectValid } from '../constants/Validators'
import { projectlink, projectsListLink } from '../routes'
import Messenger from '../constants/Messenger'
import { ColorPicker } from '../components/ColorPicker'

const debug = false

export default function ProjectCreate({ useHistory, useParams }) {
  let history = useHistory()
  let { projectId } = useParams()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#000')
  const [selected, setSelected] = useState(0)
  const [alert, setAlert] = useState([])

  useEffect(() => {
    if (projectId && typeof projectId === 'string') {
      Messenger.addListener(`${projectId}_details`, msg => {
        setName(msg.name)
        setColor(msg.color)
        setSelected(msg.selected)
      })
      Messenger.emit('ProjectDetails', projectId)
    }
    Messenger.addListener('ProjectCreateSuccess', msg => {
      // TODO: being pushed multiple times...
      debug && console.log('ProjectCreateSuccess', msg)
      setAlert([
        'Success',
        `Project ${name} Created!`,
      ])
      // if (projectValid(msg)) history.push(projectlink(msg.id))
      if (projectValid(msg)) history.push(projectsListLink(msg.id))
    })

    Messenger.addListener('ProjectCreateError', msg => {
      setAlert([
        'Error',
        msg,
      ])
      debug && console.log(msg)
    })

    return () => {
      Messenger.removeAllListeners('ProjectCreateError')
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

  const handleSubmitProject = () => {
    if (!nameValid(name)) {
      // alert('Need valid name');
      setAlert([
        'Error',
        'Need valid name',
      ])
      return false
    }
    if (!colorValid(color)) {
      // alert('Need valid color');
      setAlert([
        'Error',
        'Need valid color',
      ])
      return false
    }
    else {
      setAlert([
        'Success',
        `Project ${name} Created!`,
      ])
      return true
    }
  }

  const submit = () => {
    if (handleSubmitProject() === true) {
      if (projectId && typeof projectId === 'string') {
        Messenger.emit('ProjectEdit', { name, color, selected })
      } else {
        Messenger.emit('ProjectCreate', { name, color, selected })
      }
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={{ color: color, fontSize: 30, alignContent: 'center', textAlign: 'center', margin: 10 }}
        value={name}
        onChangeText={text => setName(text)}
        maxLength={30}
        placeholder='Project Title'
      />
      <ColorPicker selectColor={handleSelectedColor} selected={selected} />
      <View>
        <Button style={{ margin: 10 }} title='Submit' onPress={() => submit()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    margin: 20,
  },
  status: {
    fontSize: 30,
  }
});
