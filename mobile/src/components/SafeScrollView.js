import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeScrollView({ children, style, contentContainerStyle, ...props }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        contentContainerStyle,
        { paddingBottom: insets.bottom + 24 },
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
