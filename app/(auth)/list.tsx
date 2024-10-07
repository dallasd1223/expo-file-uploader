import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../provider/AuthProvider';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../config/initSupabase';
import { FileObject } from '@supabase/storage-js';
import ImageItem from '@/components/ImageItem';
import * as DocumentPicker from 'expo-document-picker'
import * as FileViewer from 'react-native-file-viewer'
import {openBrowserAsync} from 'expo-web-browser'

const List = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileObject[]>([]);

  useEffect(() => {
    if(!user) return;

    loadImages();
  }, [user]);

  const loadImages = async () => {
    const {data} = await supabase.storage.from('files').list(user!.id);
    if (data) {
      setFiles(data);
    }
  }

  const onSelectImage = async () => {
    const options: DocumentPicker.DocumentPickerOptions = {
        multiple: false,
        type: 'application/pdf',
    };

    const result = await DocumentPicker.getDocumentAsync(options);

    if (!result.canceled) {
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      const filePath = `${user!.id}/${img.name}`;
      const contentType = 'application/pdf';
      await supabase.storage.from('files').upload(filePath, decode(base64), { contentType });
      loadImages();
    }
  }

  const onRemoveImage = async (item: FileObject, listIndex: number) => {
    supabase.storage.from('files').remove([`${user!.id}/${item.name}`]);
    const newFiles = [...files];
    newFiles.splice(listIndex, 1);
    setFiles(newFiles);
  }

  const onDownloadFile = async (item: FileObject) => {
    const {data} = await supabase.storage.from('files').getPublicUrl(`${user!.id}/${item.name}`);
    openBrowserAsync(data.publicUrl);
  }

  return (
    <View style={styles.container}>
        <ScrollView>
        {files.map((item, index) => (
          <ImageItem key={item.id} item={item} userId={user!.id} onRemoveImage={() => onRemoveImage(item, index)} onDownloadFile={() => onDownloadFile(item)}/>
        ))}
      </ScrollView>

      {/* FAB to add images */}
      <TouchableOpacity onPress={onSelectImage} style={styles.fab}>
        <Ionicons name="document-text-outline" size={30} color={'#fff'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#151515',
    },
    fab: {
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      position: 'absolute',
      bottom: 40,
      right: 30,
      height: 70,
      backgroundColor: '#2b825b',
      borderRadius: 100,
    },
});

export default List