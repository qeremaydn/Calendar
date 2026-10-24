import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  useColorScheme, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar, TimelineList, LocaleConfig } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

// Takvimi Türkçeleştirme
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

const CATEGORIES = ['💼 İş', '📚 Eğitim', '🎮 Eğlence', '🏋️ Spor', '🧘 Diğer'];

export default function App() {
  const systemTheme = useColorScheme();
  const isDark = systemTheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#F3F4F6',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#1F2937',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    primary: isDark ? '#818CF8' : '#6366F1',
    primaryLight: isDark ? 'rgba(129, 140, 248, 0.2)' : '#E0E7FF',
    border: isDark ? '#374151' : '#E5E7EB',
  };

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [isModalVisible, setModalVisible] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [taskDate, setTaskDate] = useState(new Date());

  const defaultStart = new Date();
  defaultStart.setMinutes(0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 2);

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: any[] }>({});

  const formatTimeString = (dateObj: Date) => {
    return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:00`;
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;

    const dateStr = taskDate.toISOString().split('T')[0];
    const startStr = `${dateStr} ${formatTimeString(startTime)}`;
    const endStr = `${dateStr} ${formatTimeString(endTime)}`;

    const newEvent = {
      id: Date.now().toString(),
      start: startStr,
      end: endStr,
      title: taskTitle,
      summary: selectedCategory,
      color: colors.primary
    };

    setEventsByDate(prev => {
      const existing = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: [...existing, newEvent]
      };
    });

    setTaskTitle('');
    setModalVisible(false);
    setSelectedDate(dateStr);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 15, alignItems: 'center', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center', margin: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
    input: { backgroundColor: colors.background, color: colors.text, padding: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 15 },

    pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 10 },
    pickerLabel: { fontSize: 16, color: colors.text, fontWeight: '500' },

    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, marginTop: 10 },
    categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
    categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
    categoryTextActive: { color: '#fff' },

    saveButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    cancelButton: { padding: 16, alignItems: 'center', marginTop: 5 },
    cancelButtonText: { color: colors.textMuted, fontSize: 16, fontWeight: 'bold' }
  });

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Akıllı Takvim</Text>
        </View>

        <CalendarProvider
            date={selectedDate}
            onDateChanged={(date) => setSelectedDate(date)}
            showTodayButton
        >
          <ExpandableCalendar
              theme={{
                calendarBackground: colors.card,
                backgroundColor: colors.background,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
              }}
          />
          <TimelineList
              events={eventsByDate}
              timelineProps={{
                format24h: true,
                theme: {
                  backgroundColor: colors.background,
                }
              }}
              showNowIndicator
          />
        </CalendarProvider>

        <TouchableOpacity style={styles.addButton} onPress={() => {
          setTaskDate(new Date(selectedDate));
          setModalVisible(true);
        }}>
          <Text style={styles.addButtonText}>+ Yeni Görev Ekle</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Yeni Görev Detayları</Text>

                <TextInput style={styles.input} placeholder="Görev Adı (Örn: Proje Toplantısı)" placeholderTextColor={colors.textMuted} value={taskTitle} onChangeText={setTaskTitle} />

                <View style={styles.pickerRow}>
                  <Text style={styles.pickerLabel}>Tarih</Text>
                  <DateTimePicker
                      value={taskDate}
                      mode="date"
                      display="compact"
                      onChange={(_, date) => date && setTaskDate(date)}
                  />
                </View>

                <View style={styles.pickerRow}>
                  <Text style={styles.pickerLabel}>Başlangıç</Text>
                  <DateTimePicker
                      value={startTime}
                      mode="time"
                      display="spinner"
                      onChange={(_, date) => date && setStartTime(date)}
                  />
                </View>

                <View style={styles.pickerRow}>
                  <Text style={styles.pickerLabel}>Bitiş</Text>
                  <DateTimePicker
                      value={endTime}
                      mode="time"
                      display="spinner"
                      onChange={(_, date) => date && setEndTime(date)}
                  />
                </View>

                <Text style={[styles.pickerLabel, { marginTop: 10 }]}>Kategori</Text>
                <View style={styles.categoryContainer}>
                  {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                          key={cat}
                          style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                          onPress={() => setSelectedCategory(cat)}
                      >
                        <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                  <Text style={styles.addButtonText}>Kaydet</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
  );
}
