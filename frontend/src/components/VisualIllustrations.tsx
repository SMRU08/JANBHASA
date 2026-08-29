import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient,
  Stop, G, Text as SvgText, Polygon
} from 'react-native-svg';

/**
 * Premium Vector Graphic: Student Learning & Multilingual Books
 */
export function StudentHeroIllustration({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <Defs>
        <SvgLinearGradient id="gradStudentBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#D97706" stopOpacity="0.05" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradCap" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradBook" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE68A" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#B45309" />
        </SvgLinearGradient>
      </Defs>

      {/* Aura background */}
      <Circle cx="80" cy="80" r="72" fill="url(#gradStudentBg)" />
      <Circle cx="80" cy="80" r="62" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

      {/* Open Book Foundation */}
      <Path
        d="M28 115 C52 105 76 112 80 120 C84 112 108 105 132 115 L126 138 C104 128 84 133 80 138 C76 133 56 128 34 138 Z"
        fill="url(#gradBook)"
      />
      <Path
        d="M32 112 C54 103 76 109 80 117 C84 109 106 103 128 112"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Book pages lines */}
      <Path d="M42 120 C56 114 70 117 74 122" stroke="#D1FAE5" strokeWidth="1.5" />
      <Path d="M86 122 C90 117 104 114 118 120" stroke="#D1FAE5" strokeWidth="1.5" />

      {/* Student Head / Face */}
      <Circle cx="80" cy="65" r="28" fill="#FBBF24" />
      {/* Hair */}
      <Path d="M54 58 C54 38 72 32 80 32 C88 32 106 38 106 58 C96 46 88 44 80 44 C72 44 64 46 54 58 Z" fill="#334155" />
      {/* Eyes & Smile */}
      <Circle cx="71" cy="62" r="3" fill="#1E293B" />
      <Circle cx="89" cy="62" r="3" fill="#1E293B" />
      <Circle cx="72" cy="60" r="1" fill="#FFFFFF" />
      <Circle cx="90" cy="60" r="1" fill="#FFFFFF" />
      {/* Cheeks */}
      <Circle cx="66" cy="68" r="4" fill="#F43F5E" opacity="0.4" />
      <Circle cx="94" cy="68" r="4" fill="#F43F5E" opacity="0.4" />
      {/* Happy Smile */}
      <Path d="M72 71 Q80 79 88 71" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Graduation / Student Cap */}
      <Polygon points="80,18 118,34 80,48 42,34" fill="url(#gradCap)" />
      <Rect x="62" y="38" width="36" height="12" rx="4" fill="#0F172A" />
      {/* Tassel */}
      <Path d="M80 34 L114 42 L116 58" stroke="url(#gradGold)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Circle cx="116" cy="60" r="3" fill="#F59E0B" />

      {/* Sparkles / Magic Learning Symbols */}
      <G transform="translate(22, 38)">
        <Polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill="#F59E0B" />
      </G>
      <G transform="translate(126, 42)">
        <Polygon points="6,0 8,4 12,6 8,8 6,12 4,8 0,6 4,4" fill="#10B981" />
      </G>
      <G transform="translate(132, 85)">
        <Polygon points="5,0 6,3 9,5 6,7 5,10 4,7 1,5 4,3" fill="#F59E0B" />
      </G>

      {/* Tribal Script Floating Symbols (Ol Chiki / Devanagari aura) */}
      <SvgText x="20" y="85" fill="#D97706" fontSize="13" fontWeight="bold" opacity="0.8">अ</SvgText>
      <SvgText x="125" y="105" fill="#059669" fontSize="13" fontWeight="bold" opacity="0.8">ᱡ</SvgText>
      <SvgText x="30" y="55" fill="#7C3AED" fontSize="11" fontWeight="bold" opacity="0.8">१</SvgText>
    </Svg>
  );
}

/**
 * Premium Vector Graphic: Teacher Live Broadcasting & Classroom
 */
export function TeacherHeroIllustration({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <Defs>
        <SvgLinearGradient id="gradTeacherBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradTeacherSuit" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#059669" />
          <Stop offset="100%" stopColor="#064E3B" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradRadio" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#EA580C" />
        </SvgLinearGradient>
      </Defs>

      {/* Aura background */}
      <Circle cx="80" cy="80" r="72" fill="url(#gradTeacherBg)" />

      {/* Broadcast waves */}
      <Circle cx="125" cy="45" r="12" stroke="#10B981" strokeWidth="1.5" opacity="0.7" fill="none" />
      <Circle cx="125" cy="45" r="22" stroke="#10B981" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" fill="none" />
      <Circle cx="125" cy="45" r="32" stroke="#10B981" strokeWidth="1" opacity="0.2" fill="none" />

      {/* Teacher Body */}
      <Path d="M45 145 C45 112 60 102 80 102 C100 102 115 112 115 145 Z" fill="url(#gradTeacherSuit)" />
      {/* Saree/Shawl Accent */}
      <Path d="M52 145 C56 122 75 110 88 145 Z" fill="#D97706" opacity="0.9" />

      {/* Teacher Head */}
      <Circle cx="80" cy="68" r="26" fill="#FBBF24" />
      {/* Hair Bun / Professional style */}
      <Circle cx="80" cy="44" r="14" fill="#1E293B" />
      <Path d="M56 65 C56 46 70 42 80 42 C90 42 104 46 104 65 C94 52 88 50 80 50 C72 50 66 52 56 65 Z" fill="#1E293B" />
      {/* Bindi */}
      <Circle cx="80" cy="58" r="2" fill="#DC2626" />
      {/* Glasses */}
      <Circle cx="72" cy="66" r="6" stroke="#0F172A" strokeWidth="1.5" fill="none" />
      <Circle cx="88" cy="66" r="6" stroke="#0F172A" strokeWidth="1.5" fill="none" />
      <Path d="M78 66 L82 66" stroke="#0F172A" strokeWidth="1.5" />
      {/* Smile */}
      <Path d="M74 76 Q80 82 86 76" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Smart Microphone / Broadcast Badge */}
      <Circle cx="125" cy="45" r="9" fill="url(#gradRadio)" />
      <Path d="M123 41 H127 V46 H123 Z" fill="#FFFFFF" />
      <Circle cx="125" cy="48" r="2" fill="#FFFFFF" />

      {/* Glowing Star Quality Badge */}
      <G transform="translate(25, 35)">
        <Circle cx="10" cy="10" r="10" fill="#F59E0B" />
        <Polygon points="10,3 12,7 17,8 13,12 14,17 10,14 6,17 7,12 3,8 8,7" fill="#FFFFFF" />
      </G>
    </Svg>
  );
}

/**
 * Tribal Heritage Decorative Border (Warli / Sohrai / Santhali motif inspired)
 */
export function TribalMotifBar({ color = '#D97706', height = 12 }: { color?: string; height?: number }) {
  return (
    <View style={{ width: '100%', height, overflow: 'hidden', marginVertical: 4 }}>
      <Svg width="100%" height={height} viewBox="0 0 400 12" preserveAspectRatio="repeat">
        <Defs>
          <G id="tribalUnit">
            <Polygon points="10,2 18,10 2,10" fill={color} opacity="0.8" />
            <Polygon points="26,10 34,2 18,2" fill={color} opacity="0.8" />
            <Circle cx="40" cy="6" r="2.5" fill={color} />
            <Polygon points="54,2 62,10 46,10" fill={color} opacity="0.8" />
            <Polygon points="70,10 78,2 62,2" fill={color} opacity="0.8" />
            <Circle cx="84" cy="6" r="2.5" fill={color} />
          </G>
        </Defs>
        <G>
          <G transform="translate(0, 0)"><Path d="M0 6 H400" stroke={color} strokeWidth="1" opacity="0.3" /></G>
          <G transform="translate(0, 0)"><Path d="M10 2 L18 10 L26 2 L34 10 L42 2 L50 10 L58 2 L66 10 L74 2 L82 10 L90 2 L98 10 L106 2 L114 10 L122 2 L130 10 L138 2 L146 10 L154 2 L162 10 L170 2 L178 10 L186 2 L194 10 L202 2 L210 10 L218 2 L226 10 L234 2 L242 10 L250 2 L258 10 L266 2 L274 10 L282 2 L290 10 L298 2 L306 10 L314 2 L322 10 L330 2 L338 10 L346 2 L354 10 L362 2 L370 10 L378 2 L386 10 L394 2" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" /></G>
        </G>
      </Svg>
    </View>
  );
}

/**
 * NIPUN Bharat Golden Shield Emblem
 */
export function NipunBharatEmblem({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <SvgLinearGradient id="gradNipunGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE68A" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#B45309" />
        </SvgLinearGradient>
        <SvgLinearGradient id="gradTricolor" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF9933" />
          <Stop offset="50%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#138808" />
        </SvgLinearGradient>
      </Defs>

      {/* Shield Base */}
      <Path
        d="M32 4 L56 14 C56 40 44 56 32 60 C20 56 8 40 8 14 Z"
        fill="url(#gradNipunGold)"
      />
      <Path
        d="M32 8 L52 17 C52 38 42 52 32 55 C22 52 12 38 12 17 Z"
        fill="#065F46"
      />

      {/* Ashok Chakra / Sunburst center */}
      <Circle cx="32" cy="32" r="12" fill="#FFFFFF" />
      <Circle cx="32" cy="32" r="10" stroke="#000088" strokeWidth="1.2" fill="none" />
      <Circle cx="32" cy="32" r="2.5" fill="#000088" />
      {/* 8 spokes */}
      <Path d="M32 22 L32 42 M22 32 L42 32 M25 25 L39 39 M25 39 L39 25" stroke="#000088" strokeWidth="0.9" />

      {/* Stars on shield top */}
      <Polygon points="32,11 33.5,14 36.5,14 34,16 35,19 32,17 29,19 30,16 27.5,14 30.5,14" fill="#FDE68A" />
    </Svg>
  );
}

/**
 * Animated-style Live Sound Wave Visualizer
 */
export function LiveAudioWaveform({ active = true, color = '#10B981' }: { active?: boolean; color?: string }) {
  return (
    <View style={styles.waveRow}>
      {[8, 18, 28, 14, 24, 32, 20, 12, 26, 16, 30, 22, 10].map((h, i) => (
        <View
          key={i}
          style={[
            styles.waveBar,
            {
              height: active ? h : 4,
              backgroundColor: color,
              opacity: active ? (0.6 + ((i % 5) * 0.1)) : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 36,
    paddingHorizontal: 8,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
});
