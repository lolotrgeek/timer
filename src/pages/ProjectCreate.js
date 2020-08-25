import React, { useState, useEffect, useRef } from 'react'
import { View, TextInput, Text, Button, StyleSheet, } from 'react-native'
import { nameValid, colorValid, projectValid } from '../constants/Validators'
import { projectlink } from '../routes'
import Messenger from '../constants/Messenger'


export default function ProjectCreate({ useHistory, useParams }) {
  let history = useHistory()
  let { projectId } = useParams()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#000')

  useEffect(() => {
    Messenger.addListener(`${projectId}_details`, msg => {
      setName(msg.name)
      setColor(msg.color)
    })
    if (projectId && typeof projectId === 'string') {
      Messenger.emit('ProjectDetails', projectId)
    }
    Messenger.addListener('ProjectCreateSuccess', msg => {
      // TODO: being pushed multiple times...
      if (projectValid(msg)) history.push(projectlink(msg.id))
    })

    Messenger.addListener('ProjectCreateError', msg => {
      console.log(msg)
    })
  }, [])


  const submit = () => {
    if (nameValid(name) && colorValid(color)) {
      
      if (projectId && typeof projectId === 'string') {
        Messenger.emit('ProjectEdit', { name, color })
      } else {
        Messenger.emit('ProjectCreate', { name, color })
      }
    }
  }


  return (
    <View style={styles.container}>
      <Text style={{ color: color, }}>{name.length > 0 ? name : 'New Project'}</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        value={name}
        onChangeText={text => setName(text)}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        value={color}
        onChangeText={text => setColor(text)}
      />
      <View>
        <Button title='Submit' onPress={() => submit()} />
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
    marginTop: 170,
  },
  list: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#ccc'
  },
  button: {
    margin: 20,
  },
  status: {
    fontSize: 30,
  }
});
