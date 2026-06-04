import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { C, shadow, CITY_DATA, COUNTRY_DATA } from '../constants/theme';

export default function CitySearchInput({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);

  const filtered = query.length >= 1
    ? Object.keys(CITY_DATA).filter((c) => c.includes(query) && c !== value)
    : [];

  function select(city) {
    onChange(city);
    setQuery(city);
    setOpen(false);
  }

  function handleChange(text) {
    setQuery(text);
    if (text !== value) onChange('');
    setOpen(true);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    setOpen(false);
  }

  const selected = value && CITY_DATA[value];
  const cd = selected ? (COUNTRY_DATA[selected.country] || {}) : {};

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="도시 검색 (예: 오사카, 방콕...)"
          placeholderTextColor={C.faint}
          value={query}
          onChangeText={handleChange}
          onFocus={() => { if (!value) setOpen(true); }}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected city chip */}
      {selected && (
        <View style={styles.selectedChip}>
          <View style={[styles.chipCode, { backgroundColor: cd.tint || C.brandSoft }]}>
            <Text style={[styles.chipCodeText, { color: cd.ink || C.brand }]}>
              {selected.countryCode}
            </Text>
          </View>
          <Text style={styles.chipCity}>{value}</Text>
          <Text style={styles.chipCountry}>{selected.country}</Text>
        </View>
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((city, idx) => {
              const info = CITY_DATA[city];
              const ccd = COUNTRY_DATA[info.country] || {};
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.dropItem, idx > 0 && styles.dropItemBorder]}
                  onPress={() => select(city)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dropCode, { backgroundColor: ccd.tint || C.brandSoft }]}>
                    <Text style={[styles.dropCodeText, { color: ccd.ink || C.brand }]}>
                      {info.countryCode}
                    </Text>
                  </View>
                  <Text style={styles.dropCity}>{city}</Text>
                  <Text style={styles.dropCountry}>{info.country}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1, paddingVertical: 13,
    fontSize: 15, color: C.ink,
  },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: C.faint },

  selectedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 10, backgroundColor: C.brandSoft,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  chipCode: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  chipCodeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  chipCity: { fontSize: 14, fontWeight: '700', color: C.brand, flex: 1 },
  chipCountry: { fontSize: 12, color: C.muted },

  dropdown: {
    marginTop: 4, backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
    overflow: 'hidden', ...shadow.md,
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  dropItemBorder: { borderTopWidth: 1, borderTopColor: C.line2 },
  dropCode: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  dropCodeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dropCity: { fontSize: 14, fontWeight: '600', color: C.ink, flex: 1 },
  dropCountry: { fontSize: 12, color: C.muted },
});
