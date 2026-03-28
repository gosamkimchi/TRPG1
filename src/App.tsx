/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { 
  Sword, 
  Shield, 
  Scroll, 
  Map as MapIcon, 
  Users, 
  ChevronLeft,
  Sparkles,
  BookOpen,
  Dices,
  PenTool,
  Ghost,
  Flame,
  Wind,
  Heart,
  Star,
  Skull,
  Copy,
  Check,
  Zap,
  Eye,
  Music,
  Trees,
  Cross,
  Target,
  Compass,
  Layout
} from "lucide-react";

type View = "main" | "quiz" | "world";
type WorldSubView = "story" | "compendium" | "characters" | "creators";
type CompendiumSubView = "magic" | "classes" | "races" | "traits";

interface LocationInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  desc: string;
  characters: string[];
  situation?: string;
}

const ACT1_LOCATIONS: LocationInfo[] = [
  {
    id: "capital",
    name: "백작령 수도",
    x: 50, y: 45,
    desc: "제국 서쪽 변경의 중심지. 화려하지만 국경의 긴장감이 감도는 곳.",
    characters: ["백작", "백작부인", "백작 장남/딸", "집사"]
  },
  {
    id: "ruins",
    name: "폐허가 된 마을",
    x: 25, y: 65,
    desc: "오크와 고블린의 습격으로 처참하게 파괴된 국경 마을.",
    characters: ["오우거", "고블린 잔당", "오크", "갇혀있는 드워프/노움 (구출 가능)"]
  },
  {
    id: "sanctuary",
    name: "제국 서쪽령 성소",
    x: 75, y: 35,
    desc: "고대의 힘이 깃든 성소. 현재는 다크엘프들이 점거하고 있다.",
    situation: "사냥 중이던 백작이 납치된 장소",
    characters: ["다크엘프 레인저 (활잡이)", "다크엘프 호위대"]
  },
  {
    id: "orc_village",
    name: "오크 부락",
    x: 15, y: 25,
    desc: "산맥을 넘어온 오크들의 전초 기지.",
    situation: "기사단장이 잡혀있는 상황",
    characters: ["오크 주술사 (마법사)", "오크 대전사"]
  },
  {
    id: "goblin_village",
    name: "고블린 부락",
    x: 85, y: 75,
    desc: "지저분하고 위험한 함정들로 가득한 고블린들의 소굴.",
    characters: ["약물 실험 당하는 광전사", "홉고블린 성전사 (악마 숭배)", "늙은 고블린 약제사"]
  },
  {
    id: "mountain_pass",
    name: "바위산맥",
    x: 10, y: 50,
    desc: "드워프 산맥으로 이어지는 험준한 길.",
    characters: ["그림락 상단 본거지"]
  },
  {
    id: "forest",
    name: "로즈우드 숲",
    x: 40, y: 85,
    desc: "안개가 자욱하고 길을 잃기 쉬운 원시림.",
    characters: ["브라이어 도적단 은거지"]
  },
  {
    id: "swamp",
    name: "습지",
    x: 65, y: 85,
    desc: "악취가 진동하고 발을 잘못 디디면 빠져나올 수 없는 늪지대.",
    characters: ["트롤", "유괴범 마녀"]
  },
  {
    id: "refugees",
    name: "피난민 캠프",
    x: 40, y: 30,
    desc: "마을을 잃고 떠도는 낙인 찍힌 피난민들의 임시 거처.",
    characters: ["피난민 우두머리 (대피 때 활약)", "마을 촌장", "마을 처녀"]
  }
];

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    scores: {
      classes?: Record<string, number>;
      stats?: Record<string, number>;
      difficulty?: Record<string, number>;
    };
  }[];
}

const QUESTIONS: Question[] = [
  // Class Focus (1-15)
  {
    id: 1,
    text: "전쟁터 한복판, 당신의 위치는 어디인가요?",
    options: [
      { text: "가장 앞줄에서 적의 공격을 온몸으로 막아낸다", scores: { classes: { knight: 3, paladin: 2, berserker: 1 } } },
      { text: "후방에서 아군을 치유하며 기도를 올린다", scores: { classes: { priest: 3, druid: 1 } } },
      { text: "보이지 않는 곳에서 적의 목덜미를 노린다", scores: { classes: { rogue: 3, monk: 1 } } },
      { text: "안전한 거리에서 강력한 마법을 준비한다", scores: { classes: { wizard: 3, warlock: 2, elementalist: 2 } } }
    ]
  },
  {
    id: 2,
    text: "당신이 가장 믿는 힘의 근원은 무엇인가요?",
    options: [
      { text: "나의 신념과 신성한 빛", scores: { classes: { paladin: 3, priest: 2 } } },
      { text: "오랜 연구로 얻은 지식과 마법", scores: { classes: { wizard: 3, elementalist: 2 } } },
      { text: "내 몸의 근육과 단련된 기술", scores: { classes: { berserker: 2, knight: 2, monk: 2 } } },
      { text: "자연의 정령과 숲의 의지", scores: { classes: { druid: 3, elementalist: 2 } } }
    ]
  },
  {
    id: 3,
    text: "적을 마주했을 때, 당신의 첫 번째 행동은?",
    options: [
      { text: "분노를 터뜨리며 무작정 돌진한다", scores: { classes: { berserker: 3 } } },
      { text: "적의 약점을 분석하고 함정을 판다", scores: { classes: { rogue: 3, wizard: 1 } } },
      { text: "아름다운 선율로 적의 마음을 흔든다", scores: { classes: { bard: 3 } } },
      { text: "정령의 힘을 빌려 광역 공격을 퍼붓는다", scores: { classes: { elementalist: 3, druid: 1 } } }
    ]
  },
  {
    id: 4,
    text: "어두운 던전에서 보물 상자를 발견했습니다. 어떻게 할까요?",
    options: [
      { text: "함정이 있는지 꼼꼼히 살피고 해제한다", scores: { classes: { rogue: 3 } } },
      { text: "마법적인 저주가 걸려있는지 감지한다", scores: { classes: { warlock: 2, wizard: 2 } } },
      { text: "상자째로 부수고 내용물을 꺼낸다", scores: { classes: { berserker: 3, knight: 1 } } },
      { text: "동료들에게 먼저 양보하며 축복을 건넨다", scores: { classes: { priest: 3, paladin: 1 } } }
    ]
  },
  {
    id: 5,
    text: "당신이 사용하는 주된 무기는 무엇인가요?",
    options: [
      { text: "거대한 도끼나 둔기", scores: { classes: { berserker: 3, knight: 1 } } },
      { text: "단검이나 짧은 칼", scores: { classes: { rogue: 3, monk: 1 } } },
      { text: "지팡이나 신비로운 고서", scores: { classes: { wizard: 3, warlock: 2 } } },
      { text: "악기나 화려한 소품", scores: { classes: { bard: 3 } } }
    ]
  },
  {
    id: 6,
    text: "동료가 위기에 처했을 때, 당신의 선택은?",
    options: [
      { text: "대신 공격을 맞으며 방패가 되어준다", scores: { classes: { knight: 3, paladin: 2 } } },
      { text: "신성한 마법으로 즉시 치유한다", scores: { classes: { priest: 3, druid: 1 } } },
      { text: "적의 시선을 돌려 동료가 도망칠 틈을 만든다", scores: { classes: { rogue: 2, bard: 2 } } },
      { text: "강력한 마법으로 적을 단숨에 소멸시킨다", scores: { classes: { warlock: 3, wizard: 1 } } }
    ]
  },
  {
    id: 7,
    text: "당신은 어떤 방식으로 문제를 해결하나요?",
    options: [
      { text: "정정당당하게 힘으로 승부한다", scores: { classes: { knight: 2, berserker: 2, paladin: 2 } } },
      { text: "교묘한 말솜씨와 속임수를 쓴다", scores: { classes: { rogue: 2, bard: 2, warlock: 1 } } },
      { text: "명상과 정신 수양으로 답을 찾는다", scores: { classes: { monk: 3, priest: 1 } } },
      { text: "자연의 섭리에 맡기고 기다린다", scores: { classes: { druid: 3, elementalist: 1 } } }
    ]
  },
  {
    id: 8,
    text: "당신이 가장 두려워하는 상황은?",
    options: [
      { text: "나의 신념이 꺾이는 것", scores: { classes: { paladin: 3, priest: 2 } } },
      { text: "더 이상 배울 지식이 없는 것", scores: { classes: { wizard: 3 } } },
      { text: "자유를 억압당하는 것", scores: { classes: { rogue: 2, berserker: 2, bard: 1 } } },
      { text: "자연이 파괴되는 것", scores: { classes: { druid: 3, elementalist: 2 } } }
    ]
  },
  {
    id: 9,
    text: "마법을 사용할 수 있다면, 어떤 마법을 원하나요?",
    options: [
      { text: "악마와의 계약으로 얻은 금단의 마법", scores: { classes: { warlock: 3 } } },
      { text: "원소를 다스리는 화려한 마법", scores: { classes: { elementalist: 3, wizard: 1 } } },
      { text: "상처를 낫게 하고 보호하는 마법", scores: { classes: { priest: 3, paladin: 1 } } },
      { text: "동물과 대화하고 식물을 자라게 하는 마법", scores: { classes: { druid: 3 } } }
    ]
  },
  {
    id: 10,
    text: "당신의 전투 스타일은?",
    options: [
      { text: "빠른 몸놀림으로 적을 농락한다", scores: { classes: { rogue: 2, monk: 3 } } },
      { text: "묵직한 한 방으로 적을 압도한다", scores: { classes: { berserker: 3, knight: 1 } } },
      { text: "다양한 보조 마법으로 전장을 지원한다", scores: { classes: { bard: 2, priest: 2, druid: 1 } } },
      { text: "원거리에서 마법 폭격을 가한다", scores: { classes: { wizard: 2, warlock: 2, elementalist: 2 } } }
    ]
  },
  {
    id: 11,
    text: "당신이 추구하는 최고의 가치는?",
    options: [
      { text: "정의와 명예", scores: { classes: { paladin: 3, knight: 2 } } },
      { text: "지식과 진리", scores: { classes: { wizard: 3, monk: 1 } } },
      { text: "예술과 낭만", scores: { classes: { bard: 3 } } },
      { text: "생명과 조화", scores: { classes: { druid: 3, priest: 1 } } }
    ]
  },
  {
    id: 12,
    text: "길을 가다 곤경에 처한 노인을 만났습니다. 당신은?",
    options: [
      { text: "정중하게 도와드리고 축복을 빌어준다", scores: { classes: { priest: 3, paladin: 1 } } },
      { text: "마법으로 단숨에 문제를 해결해준다", scores: { classes: { wizard: 2, elementalist: 1 } } },
      { text: "노래를 불러 기운을 북돋아준다", scores: { classes: { bard: 3 } } },
      { text: "무심한 척 짐을 들어주고 사라진다", scores: { classes: { rogue: 2, berserker: 1 } } }
    ]
  },
  {
    id: 13,
    text: "당신이 가장 좋아하는 장소는?",
    options: [
      { text: "엄숙한 분위기의 성당", scores: { classes: { priest: 3, paladin: 2 } } },
      { text: "책이 가득한 도서관", scores: { classes: { wizard: 3 } } },
      { text: "활기찬 시장통이나 술집", scores: { classes: { bard: 3, rogue: 1 } } },
      { text: "깊은 숲속이나 폭포 아래", scores: { classes: { druid: 3, monk: 2, elementalist: 1 } } }
    ]
  },
  {
    id: 14,
    text: "전투가 끝난 후, 당신은 무엇을 하나요?",
    options: [
      { text: "무기를 닦으며 다음 전투를 준비한다", scores: { classes: { knight: 2, berserker: 2 } } },
      { text: "명상을 하며 마음을 가다듬는다", scores: { classes: { monk: 3, priest: 1 } } },
      { text: "승리의 노래를 부르며 축배를 든다", scores: { classes: { bard: 3 } } },
      { text: "적의 시체에서 쓸만한 물건을 찾는다", scores: { classes: { rogue: 3, warlock: 1 } } }
    ]
  },
  {
    id: 15,
    text: "당신을 한 단어로 표현한다면?",
    options: [
      { text: "강인함", scores: { classes: { berserker: 2, knight: 2 } } },
      { text: "신비함", scores: { classes: { warlock: 2, elementalist: 2, wizard: 1 } } },
      { text: "유연함", scores: { classes: { monk: 2, rogue: 2, bard: 1 } } },
      { text: "경건함", scores: { classes: { priest: 2, paladin: 2 } } }
    ]
  },
  // Stat Focus (16-20)
  {
    id: 16,
    text: "당신은 평소에 체력 관리를 어떻게 하나요?",
    options: [
      { text: "매일 고강도 근력 운동을 한다", scores: { stats: { strength: 3 } } },
      { text: "균형 잡힌 식단과 충분한 휴식을 취한다", scores: { stats: { health: 3 } } },
      { text: "빠른 반사신경을 위한 유연성 운동을 한다", scores: { stats: { agility: 3 } } },
      { text: "명상과 독서로 정신력을 단련한다", scores: { stats: { intelligence: 2, charisma: 1 } } }
    ]
  },
  {
    id: 17,
    text: "무거운 짐을 옮겨야 할 때, 당신의 방법은?",
    options: [
      { text: "그냥 내 힘으로 들어서 옮긴다", scores: { stats: { strength: 3 } } },
      { text: "지렛대의 원리나 도구를 이용한다", scores: { stats: { intelligence: 3 } } },
      { text: "주변 사람들에게 도움을 요청한다", scores: { stats: { charisma: 3 } } },
      { text: "조금씩 여러 번 나누어 옮긴다", scores: { stats: { health: 2, agility: 1 } } }
    ]
  },
  {
    id: 18,
    text: "위험한 함정을 피해야 할 때, 당신의 강점은?",
    options: [
      { text: "눈보다 빠른 몸놀림", scores: { stats: { agility: 3 } } },
      { text: "함정의 구조를 파악하는 두뇌", scores: { stats: { intelligence: 3 } } },
      { text: "함정에 걸려도 버텨낼 수 있는 맷집", scores: { stats: { health: 3 } } },
      { text: "운 좋게 함정이 작동하지 않게 만드는 매력", scores: { stats: { charisma: 3 } } }
    ]
  },
  {
    id: 19,
    text: "사람들과 대화할 때 당신은 어떤 스타일인가요?",
    options: [
      { text: "논리적이고 분석적으로 말한다", scores: { stats: { intelligence: 3 } } },
      { text: "상대방의 마음을 사로잡는 화술을 구사한다", scores: { stats: { charisma: 3 } } },
      { text: "말보다는 행동으로 보여준다", scores: { stats: { strength: 2, health: 1 } } },
      { text: "상대방의 움직임을 관찰하며 조심스럽게 말한다", scores: { stats: { agility: 3 } } }
    ]
  },
  {
    id: 20,
    text: "가장 자신 있는 신체 부위는?",
    options: [
      { text: "단단한 근육", scores: { stats: { strength: 3 } } },
      { text: "지치지 않는 심장", scores: { stats: { health: 3 } } },
      { text: "날렵한 다리", scores: { stats: { agility: 3 } } },
      { text: "아름다운 얼굴이나 목소리", scores: { stats: { charisma: 3 } } }
    ]
  },
  // Difficulty Focus (21-25)
  {
    id: 21,
    text: "게임을 할 때 당신이 선호하는 방식은?",
    options: [
      { text: "스토리를 즐기며 편하게 여행하고 싶다", scores: { difficulty: { explorer: 3 } } },
      { text: "적당한 긴장감과 재미를 원한다", scores: { difficulty: { balanced: 3 } } },
      { text: "치밀한 전략을 짜서 어려운 고비를 넘기고 싶다", scores: { difficulty: { tactician: 3 } } },
      { text: "죽음의 문턱까지 가는 극한의 도전을 즐긴다", scores: { difficulty: { tactician: 5 } } }
    ]
  },
  {
    id: 22,
    text: "전투 중 예상치 못한 변수가 발생했습니다. 당신은?",
    options: [
      { text: "당황스럽지만 게임이 도와주길 바란다", scores: { difficulty: { explorer: 3 } } },
      { text: "차분하게 대응하며 상황을 수습한다", scores: { difficulty: { balanced: 3 } } },
      { text: "변수조차 계산에 넣고 역전의 기회로 삼는다", scores: { difficulty: { tactician: 3 } } },
      { text: "오히려 좋아! 더 짜릿한 상황을 즐긴다", scores: { difficulty: { tactician: 2, balanced: 1 } } }
    ]
  },
  {
    id: 23,
    text: "아이템 세팅이나 스킬 트리를 짤 때 당신은?",
    options: [
      { text: "그냥 예쁘거나 멋진 것을 고른다", scores: { difficulty: { explorer: 3 } } },
      { text: "추천하는 무난한 세팅을 따른다", scores: { difficulty: { balanced: 3 } } },
      { text: "모든 수치를 계산하여 최적의 효율을 찾는다", scores: { difficulty: { tactician: 3 } } },
      { text: "남들이 안 쓰는 독특한 빌드를 연구한다", scores: { difficulty: { tactician: 2, balanced: 1 } } }
    ]
  },
  {
    id: 24,
    text: "강력한 보스 몬스터를 만났습니다. 당신의 마음가짐은?",
    options: [
      { text: "빨리 잡고 다음 이야기를 보고 싶다", scores: { difficulty: { explorer: 3 } } },
      { text: "몇 번 도전하면 잡을 수 있겠지?", scores: { difficulty: { balanced: 3 } } },
      { text: "패턴을 완벽히 분석해서 노데미지로 잡겠다", scores: { difficulty: { tactician: 3 } } },
      { text: "보스가 너무 약한 건 아닐까 걱정된다", scores: { difficulty: { tactician: 5 } } }
    ]
  },
  {
    id: 25,
    text: "당신에게 TRPG란 무엇인가요?",
    options: [
      { text: "친구들과 떠나는 즐거운 소풍", scores: { difficulty: { explorer: 3 } } },
      { text: "하나의 멋진 판타지 소설 쓰기", scores: { difficulty: { balanced: 3 } } },
      { text: "나의 한계를 시험하는 전략 시뮬레이션", scores: { difficulty: { tactician: 3 } } },
      { text: "이 세계의 진정한 영웅이 되는 과정", scores: { difficulty: { tactician: 1, balanced: 2 } } }
    ]
  }
];

const CLASS_INFO: Record<string, { name: string, desc: string, icon: React.ReactNode, category: string }> = {
  priest: { name: "사제", desc: "신성한 빛으로 아군을 치유하고 보호하는 성스러운 인도자", icon: <Cross className="w-12 h-12" />, category: "신성 계열" },
  paladin: { name: "성기사", desc: "신념의 방패로 악을 물리치고 동료를 지키는 고결한 기사", icon: <Shield className="w-12 h-12" />, category: "신성 계열" },
  monk: { name: "수도승", desc: "정신 수양을 통해 육체를 무기로 사용하는 고요한 파괴자", icon: <Zap className="w-12 h-12" />, category: "신성 계열" },
  berserker: { name: "광전사", desc: "분노의 힘으로 전장을 휩쓰는 거침없는 전사", icon: <Flame className="w-12 h-12" />, category: "전사 계열" },
  knight: { name: "기사", desc: "단련된 무술과 전술로 전장을 지휘하는 명예로운 전사", icon: <Sword className="w-12 h-12" />, category: "전사 계열" },
  warlock: { name: "흑마법사", desc: "금지된 계약을 통해 어둠의 힘을 부리는 신비로운 마법사", icon: <Skull className="w-12 h-12" />, category: "마법 계열" },
  wizard: { name: "마법사", desc: "오랜 연구와 지식으로 비전 마법을 구사하는 현자", icon: <PenTool className="w-12 h-12" />, category: "마법 계열" },
  elementalist: { name: "정령사", desc: "자연의 원소 정령들과 소통하며 강력한 마법을 부리는 술사", icon: <Sparkles className="w-12 h-12" />, category: "마법 계열" },
  druid: { name: "드루이드", desc: "자연의 섭리를 따르며 동식물과 교감하는 숲의 수호자", icon: <Trees className="w-12 h-12" />, category: "마법 계열" },
  rogue: { name: "도적", desc: "그림자 속에서 기회를 노리는 날렵하고 은밀한 추적자", icon: <Ghost className="w-12 h-12" />, category: "기교 계열" },
  bard: { name: "음유시인", desc: "노래와 연주로 아군에게 용기를, 적에게 혼란을 주는 예술가", icon: <Music className="w-12 h-12" />, category: "기교 계열" }
};

const DIFFICULTY_INFO: Record<string, { name: string, icon: React.ReactNode, desc: string }> = {
  explorer: { name: "탐험가 (쉬움)", icon: <Compass className="w-8 h-8" />, desc: "스토리와 모험을 즐기기에 최적화된 난이도" },
  balanced: { name: "균형 (보통)", icon: <Target className="w-8 h-8" />, desc: "적절한 도전과 재미가 공존하는 표준 난이도" },
  tactician: { name: "전술가 (어려움)", icon: <Layout className="w-8 h-8" />, desc: "치밀한 전략과 수치 계산이 필요한 극한의 난이도" }
};

interface Spell {
  name: string;
  damage?: string;
  desc: string;
}

const SPELLS: Record<string, Spell[]> = {
  cantrip: [
    { name: "화염 화살", damage: "1d10 화염 (5레벨: 2d10 / 10레벨: 3d10)", desc: "작은 불씨를 던져 대상에게 화염 피해를 입힌다. 명중 시 불꽃이 짧게 타오른다." },
    { name: "빙결 구체", damage: "1d8 냉기 (5레벨: 2d8 / 10레벨: 3d8)", desc: "구체를 발사해 대상에게 냉기 피해를 입히고, 다음 턴까지 이동 속도를 감소시킨다." },
    { name: "전압의 손길", damage: "1d8 번개 (5레벨: 2d8 / 10레벨: 3d8)", desc: "손에 번개를 두르고 적을 직접 접촉해 피해를 준다. 금속 갑옷을 입은 대상에게는 명중이 유리하다." },
    { name: "마법의 손", desc: "보이지 않는 마법의 손을 생성해 물체를 들어 올리거나 밀고 당기는 등 간단한 상호작용을 수행한다." },
    { name: "하급 환영", desc: "작은 소리나 시각적 환영을 만들어 주변을 속인다. 환영은 물리적 접촉 시 쉽게 간파된다." },
    { name: "빛", desc: "물체 하나를 빛나게 만들어 주변을 밝힌다. 어둠 속 탐험에 유용하다." },
    { name: "인도", desc: "10턴 동안 대상은 능력 판정에 +1d4 보너스를 얻는다. 집중이 필요할 수 있다." },
    { name: "걸쭉한 인신공격", damage: "1d4 정신 (5레벨: 2d4 / 10레벨: 3d4)", desc: "상대를 조롱하여 정신적 피해를 입히고, 대상의 다음 공격 굴림에 불리 보정을 부여한다." },
    { name: "덩굴채찍", damage: "1d6 관통", desc: "가시 덩굴을 뻗어 대상을 가격하고, 명중 시 대상을 자신 쪽으로 3m 끌어당긴다." },
  ],
  level1: [
    { name: "마력보호막", desc: "7의 임시 생명력을 얻는다. (주문 레벨당 +5)" },
    { name: "기름칠", desc: "바닥을 기름으로 뒤덮어 크리처를 둔화시키고, 일정 확률로 넘어뜨린다. 사거리 18m / 반경 4m / 민첩 내성" },
    { name: "깃털낙하", desc: "자신과 주변의 아군이 낙하 피해에 면역" },
    { name: "짐승 교감", desc: "지능 3 이하의 야수를 설득해 공격하지 않게 만든다. 대상이 피해를 받으면 효과가 종료된다. (주문 레벨당 대상 +1)" },
    { name: "마녀의 찌리릿", damage: "1d12 번개", desc: "대상에게 번개를 발사해 연결한다. 이후 매 턴 1d12 피해를 추가로 준다. (주문 레벨당 +1d12)" },
    { name: "마력 화살", damage: "3d4", desc: "빗나가지 않는 마력 탄환 3개를 발사한다. (주문 레벨당 탄환 +1)" },
    { name: "마법 갑옷", desc: "방어도를 보정" },
    { name: "뜨거운 포옹", damage: "3d6 화염", desc: "전방에 부채꼴화염을 분출한다. 인화성 대상은 추가 피해1d4를 받는다. (주문 레벨당 +1d6)" },
    { name: "강렬한 빛", desc: "총합 33 생명력 이하의 크리처들을 실명시킨다. (주문 레벨당 +11)" },
    { name: "수면", desc: "총합 24 생명력 이하의 크리처들을 잠재운다." },
    { name: "안개구름", desc: "범위 내를 짙은 안개로 덮어 모든 크리처를 실명 상태로 만들고 시야를 차단한다. (주문 레벨당 반경 +2m)" },
    { name: "얼음 단검", damage: "1d10 관통 + 2d6 냉기", desc: "얼음 단검을 던져 명중 시 추가 냉기 폭발을 일으킨다. 빗나가도 폭발은 발생한다. (주문 레벨당 +1d6)" },
    { name: "자연의 오브", damage: "2d8 선택 속성", desc: "불, 얼음, 바람, 번개, 대지 중 하나의 속성을 선택해 피해를 주고, 일정 확률로 해당 속성의 표면을 생성한다. (주문 레벨당 +1d8)" },
    { name: "매혹", desc: "인간형을 매혹시켜 공격하지 못하게 한다. 대화 중 매력 판정에 유리 보정을 얻는다. 피해를 받으면 효과가 종료된다. 높은 난이도에서는 대상이 시전자에게 적대감을 가질 수 있다. (주문 레벨당 대상 +1)" },
    { name: "변장", desc: "마법으로 자신의 외형을 변화시킨다. (주문 슬롯 소모 없음)" },
    { name: "강풍", damage: "2d8", desc: "강력한 음파를 방출해 범위 내 모든 크리처와 물체를 밀어낸다." },
    { name: "명령", desc: "대상에게 단순한 행동(도주, 접근, 정지, 엎드리기, 무기 버리기)을 강제한다. 강한 대상은 저항할 수 있다." },
  ],
  level2: [
    { name: "단검 구름", damage: "4d4 관통", desc: "특정 지점에 떠 있는 단검 구름을 생성한다. 범위에 들어가거나 턴을 시작하면 피해를 입는다." },
    { name: "산성 화살", damage: "4d4 산성 + 다음 턴 2d4", desc: "산성 화살을 발사해 지속 피해를 입힌다. 빗나가도 절반 피해를 준다." },
    { name: "파쇄", damage: "3d8 천둥", desc: "범위 내에 강한 진동을 일으켜 피해를 준다. 무생물과 구조물에는 더 큰 피해를 준다." },
    { name: "작열 광선", damage: "2d6 화염 × 3발", desc: "세 개의 화염 광선을 발사한다. 각각 다른 대상 지정 가능하다." },
    { name: "화염 검", damage: "3d6 화염", desc: "손에 화염 검을 생성해 근접 공격을 한다." },
    { name: "화염 구체", damage: "2d6 화염", desc: "굴러다니는 화염 구체를 생성한다. 보너스 액션으로 이동 가능하며 접촉 시 피해를 준다." },
    { name: "그림자 검", damage: "2d8 정신", desc: "그림자로 이루어진 검을 생성한다. 어둠 속에서는 공격에 유리 보정을 받는다." },
    { name: "광기 왕관", desc: "인간형 대상을 광기에 빠뜨려 인접한 크리처를 공격하게 만든다. 매 턴 내성 굴림 가능." },
    { name: "거미줄", desc: "범위를 끈적한 거미줄로 덮는다. 대상은 속박되며 힘 판정으로 탈출할 수 있다. 불에 닿으면 불타며 피해를 준다." },
    { name: "약화 광선", desc: "대상의 힘을 약화시켜 힘 기반 공격 피해를 절반으로 감소시킨다." },
    { name: "실명", desc: "대상 하나를 실명 상태로 만든다. 지속 중 반복 내성 가능." },
    { name: "인간형 포박", desc: "인간형 대상 하나를 마비시킨다. 근접 공격은 자동 치명타가 된다." },
    { name: "감정 평정", desc: "분노, 공포, 매혹 상태를 억제한다. 집단 제어 및 사회적 상황에 유용하다." },
    { name: "안개 걸음", desc: "약 9m를 순간이동한다. 보너스 액션으로 사용 가능하다." },
    { name: "돌풍", desc: "강한 바람을 직선으로 방출한다. 대상은 밀려나며 원거리 공격이 불리해진다. 안개와 가스를 밀어낼 수 있다." },
    { name: "가시밭", damage: "이동 시 2d4 관통", desc: "땅을 가시로 덮는다. 이동할수록 피해를 입으며 지형 통제가 가능하다. (이동 거리당 반복)" },
    { name: "침묵", desc: "범위 내 모든 소리를 차단한다. 주문 시전 방해 및 잠입에 유용하다." },
    { name: "지원", desc: "최대 3명의 아군의 최대 및 현재 생명력을 5 증가시킨다. (주문 레벨당 +5)" },
    { name: "마법 무기", desc: "무기를 강화해 명중 및 피해에 +1 보너스를 부여한다. (상위 레벨 시 증가)" },
    { name: "암시야", desc: "대상은 약 18m 거리까지 어둠 속에서도 볼 수 있다." },
    { name: "능력 강화", desc: "선택한 능력치 판정에 유리 보정을 부여한다." },
    { name: "잔상", desc: "몸이 흐릿하게 왜곡되어 공격이 빗나갈 확률이 증가한다." },
    { name: "생각 탐지", desc: "주변 생물의 표면적인 생각을 읽는다. 집중 시 더 깊은 사고를 탐색할 수 있다." },
    { name: "투명 감지", desc: "투명 상태의 존재를 감지할 수 있다." },
    { name: "투명화", desc: "대상 하나를 보이지 않게 만든다. 공격 또는 주문 사용 시 해제된다." },
    { name: "어둠", desc: "완전한 암흑 구역을 생성한다. 대부분의 시야와 감지가 차단된다." },
    { name: "노크", desc: "잠긴 문이나 자물쇠를 강제로 연다. 마법적 봉인도 해제 가능하지만 큰 소리를 낸다." },
    { name: "비전 자물쇠", desc: "문이나 상자를 마법적으로 봉인한다. 특정 대상만 열 수 있도록 설정할 수 있다." },
    { name: "확대/축소", desc: "대상의 크기를 변화시킨다. 확대: 피해 +1d4, 힘 판정 유리 / 축소: 피해 -1d4, 민첩 판정 유리" },
  ],
  level3: [
    { name: "폭열 구체", damage: "8d6 화염", desc: "지정 지점에 폭발을 일으켜 범위 내 모든 대상에게 피해를 준다. 민첩 내성 성공 시 절반 피해. (주문 레벨당 +1d6)" },
    { name: "전격 광선", damage: "8d6 번개", desc: "직선으로 번개를 방출해 경로상의 모든 대상에게 피해를 준다. 민첩 내성 성공 시 절반 피해. (주문 레벨당 +1d6)" },
    { name: "낙뢰 부름", damage: "3d10 번개", desc: "폭풍 구름을 생성하고 지정 지점에 번개를 떨어뜨린다. 매 턴 추가로 낙뢰를 호출할 수 있다. (반복 가능)" },
    { name: "최면 문장", desc: "범위 내 크리처들을 매혹 상태로 만들어 행동 불능 상태로 만든다. 피해를 받으면 효과가 해제된다." },
    { name: "공포 방출", desc: "원뿔 범위 내 대상에게 공포를 부여한다. 대상은 도망치며 시전자에게 접근할 수 없다." },
    { name: "악취 구름", desc: "구름 속 대상은 행동 불능 상태가 될 수 있으며 시야가 차단된다." },
    { name: "우박 폭풍", desc: "넓은 범위를 얼음과 눈으로 덮는다. 대상은 넘어질 수 있으며 집중이 방해된다." },
    { name: "가속화", desc: "대상의 속도와 반응이 크게 증가한다. 추가 행동 1회를 얻고 방어 보너스를 받는다. 효과 종료 시 한 턴 동안 행동할 수 없다." },
    { name: "감속", desc: "여러 대상의 행동 속도를 늦춘다. 이동 속도 감소, 행동 제한, 반응 불가 효과를 받는다." },
    { name: "주문 차단", desc: "시전 중인 주문을 즉시 취소한다. 고레벨 주문은 판정이 필요하다." },
    { name: "즉시 부활", desc: "사망한 지 1분 이내의 대상을 되살린다. 대상은 1의 생명력으로 부활한다." },
    { name: "비행 부여", desc: "대상에게 비행 능력을 부여한다." },
    { name: "기체 변환", desc: "대상을 안개 형태로 변화시킨다. 공격은 불가능하지만 좁은 틈을 통과할 수 있다." },
    { name: "차원 점멸", desc: "매 턴 종료 시 일정 확률로 다른 차원으로 이동해 공격을 회피한다." },
    { name: "망자 교신", desc: "시체와 대화해 생전의 기억 일부를 질문할 수 있다." },
    { name: "저주 부여", desc: "대상에게 지속적인 불이익을 부여한다." },
    { name: "저주 해제", desc: "마법적 저주를 제거한다." },
    { name: "속성 보호", desc: "선택한 속성 피해에 대한 저항을 부여한다." },
    { name: "집단 치유의 언어", desc: "여러 아군을 동시에 치유한다." },
    { name: "망자 지배", desc: "시체를 언데드로 되살려 조종한다." },
    { name: "공허의 굶주림", damage: "2d6 냉기 + 2d6 산성", desc: "어둠의 영역을 생성해 지속 피해와 실명 효과를 부여한다. (턴마다 반복)" },
    { name: "식물 성장", desc: "식물을 급격히 성장시켜 이동을 방해하거나 환경을 변화시킨다." },
    { name: "성전사의 오라", desc: "주변 아군의 공격에 추가 광휘 피해를 부여한다." },
    { name: "원소 부여", desc: "무기에 원소 피해를 부여하고 명중 보너스를 제공한다." },
    { name: "영혼 수호", damage: "3d8 광휘 또는 강령", desc: "주변에 영혼을 소환해 적에게 지속 피해를 주고 이동을 방해한다." },
  ],
  level4: [
    { name: "강제 추방", desc: "대상 하나를 다른 차원으로 추방한다. 대상이 원래 차원의 존재가 아닐 경우, 영구적으로 사라진다. 집중이 끝나면 대상은 원래 위치로 돌아온다." },
    { name: "차원 도약문", desc: "시전자와 대상 1명을 먼 거리(약 150m)까지 순간이동시킨다. 시야가 없어도 이동할 수 있다." },
    { name: "완전 투명화", desc: "대상이 공격하거나 주문을 사용해도 투명 상태가 유지된다." },
    { name: "화염 장벽", damage: "5d8 화염", desc: "불타는 벽을 생성한다. 벽을 통과하거나 가까이 있는 대상은 피해를 입는다." },
    { name: "흑촉수 구속", damage: "3d6 타격 (턴마다)", desc: "어둠의 촉수가 바닥에서 솟아나 대상을 붙잡는다. 속박 상태가 되며 지속 피해를 입는다." },
    { name: "빙결 폭풍", damage: "2d8 타격 + 4d6 냉기", desc: "얼음과 우박이 쏟아져 범위 피해를 주고, 지형을 험하게 만들어 이동을 방해한다." },
    { name: "완전 변신", desc: "대상 크리처를 다른 형태로 변환한다. 변신한 형태의 능력치를 사용하며, 체력이 0이 되면 원래 모습으로 돌아온다." },
    { name: "죽음 방지", desc: "대상이 사망할 상황에서 대신 1의 생명력으로 버틴다. 효과는 1회 발동 후 종료된다." },
    { name: "구속 해방", desc: "대상은 이동 제한 및 구속 효과를 무시하고 자유롭게 이동할 수 있다." },
    { name: "석화 피부", desc: "비마법적 물리 피해에 대한 저항을 얻는다." },
    { name: "혼란 유발", desc: "범위 내 대상들이 무작위 행동을 하게 된다. 아군과 적을 구분하지 못할 수 있다." },
    { name: "자연 정령 소환", desc: "자연의 존재를 소환해 전투를 돕게 한다." },
    { name: "원소 정령 소환", desc: "불, 물, 바람, 대지 중 하나의 정령을 소환한다." },
    { name: "야수 지배", desc: "야수를 지배하여 명령을 따르게 만든다." },
    { name: "신성 수호자", damage: "20 광휘", desc: "지정 위치에 수호자를 소환한다. 적이 접근하면 자동으로 피해를 준다." },
    { name: "환영 살해", damage: "4d10 정신 (턴마다)", desc: "대상에게 공포의 환영을 심어 지속적인 정신 피해를 입힌다." },
    { name: "부패 역병", desc: "대상에게 질병을 부여해 지속적인 불이익을 준다." },
  ],
  level5: [
    { name: "완전 포박", desc: "대상 하나를 완전히 마비시킨다. 모든 행동이 불가능하며, 근접 공격은 자동 치명타가 된다." },
    { name: "정신 지배", desc: "대상 인간형을 지배해 행동을 조종한다. 지속 중 대상은 반복 내성 굴림을 시도할 수 있다." },
    { name: "빙결 분사", damage: "8d8 냉기", desc: "원뿔 범위로 냉기를 분사한다. 민첩 내성 성공 시 절반 피해." },
    { name: "죽음의 구름", damage: "5d8 독 (턴마다)", desc: "치명적인 독성 구름을 생성한다. 구름은 이동하며 범위 내 대상에게 지속 피해를 입힌다." },
    { name: "화염 강타", damage: "4d6 화염 + 4d6 광휘", desc: "하늘에서 불기둥이 떨어져 범위 내 대상에게 피해를 준다." },
    { name: "파괴 파동", damage: "5d6 천둥 + 5d6 선택 속성", desc: "충격파를 방출해 주변 적에게 피해를 주고, 넘어뜨릴 수 있다." },
    { name: "석벽 생성", desc: "원하는 형태로 돌벽을 생성한다. 전장을 차단하거나 구조물을 만들 수 있다." },
    { name: "완전 회복", desc: "석화, 저주, 능력치 감소 등 심각한 상태 이상을 제거한다." },
    { name: "염력 조작", desc: "물체나 크리처를 들어 올리고 이동시킨다. 전투, 탐험, 환경 조작에 모두 활용할 수 있다." },
    { name: "집단 치유", desc: "범위 내 여러 아군의 생명력을 회복한다." },
    { name: "정화 해제", desc: "악성 효과, 빙의, 차원적 영향 등을 제거한다." },
    { name: "집단 변장", desc: "여러 대상을 다른 모습으로 변장시킨다. 잠입 및 사회적 상황에서 유용하다." },
    { name: "상급 정령 소환", desc: "강력한 정령을 소환해 전투를 돕게 한다." },
    { name: "부패 감염", desc: "대상에게 질병을 부여해 지속적인 약화를 유도한다." },
    { name: "곤충 군락", damage: "4d10 관통 (턴마다)", desc: "벌레 떼를 소환해 범위 내 대상에게 지속 피해를 준다." },
    { name: "차원 속박", desc: "대상이 다른 차원으로 이동하지 못하도록 봉인한다." },
    { name: "권능 박탈", desc: "대상의 능력이나 권한을 일시적으로 무력화한다. (효과는 설정에 따라 조정 가능)" },
    { name: "추방의 일격", desc: "공격 시 추가 피해를 주고, 대상은 실패 시 다른 차원으로 추방된다." },
  ],
  level6: [
    { name: "연쇄 전격", damage: "10d8 번개", desc: "번개가 한 대상에서 시작해 최대 3개의 추가 대상에게 튕긴다. 민첩 내성 성공 시 절반 피해." },
    { name: "죽음의 파동", damage: "8d6 강령", desc: "넓은 범위에 죽음의 에너지를 방출해 다수의 적에게 피해를 준다." },
    { name: "빙결 구체", damage: "10d6 냉기", desc: "폭발하는 얼음 구체를 던져 범위 내 대상에게 피해를 준다." },
    { name: "태양 광선", damage: "6d8 광휘 (반복 가능)", desc: "강렬한 빛의 광선을 발사한다. 명중 시 대상은 실명 상태가 될 수 있다." },
    { name: "분해 광선", damage: "10d6 + 40 역장", desc: "대상 하나를 분해하는 광선을 발사한다. 체력이 0이 되면 완전히 소멸한다." },
    { name: "절대 구체", desc: "완전하게 차단된 보호 구체를 생성한다. 외부의 모든 공격과 효과를 차단한다." },
    { name: "차원 관문", desc: "두 지점을 연결하는 관문을 생성한다. 여러 아군이 자유롭게 통과할 수 있다." },
    { name: "바람 형상", desc: "여러 아군을 기체 형태로 변환한다. 빠르게 이동할 수 있으나 전투는 불가능하다." },
    { name: "완전 치유", desc: "대상 하나의 생명력을 크게 회복하고 대부분의 상태 이상을 제거한다." },
    { name: "석화 시선", desc: "대상이나 자신의 몸을 돌로 변화시킨다. 실패 시 완전히 석화된다." },
    { name: "파멸의 시선", desc: "시선으로 대상에게 다양한 상태 이상을 부여한다. (공포, 기절, 약화 등)" },
    { name: "가시 장벽", damage: "7d8 관통", desc: "날카로운 가시 벽을 생성한다. 통과 시 큰 피해를 입고 이동이 제한된다." },
    { name: "빙벽", damage: "10d6 냉기", desc: "얼음 벽을 생성한다. 파괴 시 폭발하며 피해를 준다." },
    { name: "검의 장벽", damage: "6d10 참격", desc: "회전하는 검의 장벽을 생성한다. 접촉 시 지속 피해를 입힌다." },
    { name: "영웅의 연회", desc: "아군 전체에게 강력한 장기 버프를 부여한다. 공포 및 독 면역, 최대 생명력 증가 효과를 얻는다." },
    { name: "언데드 창조", desc: "시체를 강력한 언데드로 되살려 조종한다." },
    { name: "상급정령 소환", desc: "상급정령을 소환해 전투를 돕게 한다." },
    { name: "생명 흡수", damage: "14d6 강령", desc: "대상에게 생명력을 급격히 약화시킨다. 성공 시 절반 피해를 입는다." },
  ],
};

interface ClassInfo {
  name: string;
  subClasses: string[];
}

interface ClassCategory {
  category: string;
  classes: ClassInfo[];
}

const CLASSES: ClassCategory[] = [
  {
    category: "전사계열",
    classes: [
      { name: "전사", subClasses: ["광전사", "비전검사", "기사", "투사"] }
    ]
  },
  {
    category: "신성계열",
    classes: [
      { name: "사제", subClasses: ["빛의 사제", "어둠의 사제"] },
      { name: "성기사", subClasses: ["빛의 성기사", "빛을 저버린자"] },
      { name: "수도승", subClasses: ["수도승", "파계승"] }
    ]
  },
  {
    category: "마법계열",
    classes: [
      { name: "마법사", subClasses: ["정령술사", "사령술사", "흑마법사", "마법사"] },
      { name: "드루이드", subClasses: ["야생의 드루이드", "달의 드루이드"] }
    ]
  },
  {
    category: "기교계열",
    classes: [
      { name: "궁수", subClasses: ["비전궁수", "악마사냥꾼", "야수조련사", "사수"] },
      { name: "도적", subClasses: ["도둑", "팬텀", "어쌔씬"] },
      { name: "음유시인", subClasses: ["검의 학파", "지식의 학파", "매혹의 학파"] }
    ]
  }
];

const RACES = [
  "인간", "엘프", "드워프", "마족", "오우거", 
  "오크", "고블린", "놀", "트롤", "악마", 
  "늑대인간", "슬라임", "언데드", "하플링", "노움"
];

interface QuizResult {
  className: string;
  primaryStat: string;
  secondaryStat: string;
  difficulty: string;
  stats: Record<string, number>;
}

export default function App() {
  const [view, setView] = useState<View>("main");
  const [worldSubView, setWorldSubView] = useState<WorldSubView>("story");
  const [storyAct, setStoryAct] = useState<number>(0); // 0: Background, 1: Act 1, 2: Act 2, 3: Act 3
  const [compendiumSubView, setCompendiumSubView] = useState<CompendiumSubView>("magic");
  const [magicLevel, setMagicLevel] = useState<string>("cantrip");
  const [hoveredLoc, setHoveredLoc] = useState<LocationInfo | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [scores, setScores] = useState({
    classes: {} as Record<string, number>,
    stats: {} as Record<string, number>,
    difficulty: {} as Record<string, number>
  });
  const [result, setResult] = useState<QuizResult | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} 복사되었습니다!`, {
        style: {
          fontFamily: 'var(--font-hand)',
          fontSize: '1.1rem',
          backgroundColor: '#f5f5f0',
          color: '#1a1a1a',
          border: '2px solid #1a1a1a'
        }
      });
    }).catch(() => {
      toast.error("복사에 실패했습니다.");
    });
  };

  const handleAnswer = (answerScores: Question["options"][0]["scores"]) => {
    const newScores = { ...scores };
    
    if (answerScores.classes) {
      Object.entries(answerScores.classes).forEach(([cls, score]) => {
        newScores.classes[cls] = (newScores.classes[cls] || 0) + score;
      });
    }
    if (answerScores.stats) {
      Object.entries(answerScores.stats).forEach(([stat, score]) => {
        newScores.stats[stat] = (newScores.stats[stat] || 0) + score;
      });
    }
    if (answerScores.difficulty) {
      Object.entries(answerScores.difficulty).forEach(([diff, score]) => {
        newScores.difficulty[diff] = (newScores.difficulty[diff] || 0) + score;
      });
    }
    
    setScores(newScores);

    if (quizStep < QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: typeof scores) => {
    // Class
    let maxClassScore = -1;
    let winnerClass = "knight";
    Object.entries(finalScores.classes).forEach(([cls, score]) => {
      const s = score as number;
      if (s > maxClassScore) {
        maxClassScore = s;
        winnerClass = cls;
      }
    });

    // Stats
    const sortedStats = Object.entries(finalScores.stats)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
    
    const primaryStat = sortedStats[0]?.[0] || "strength";
    const secondaryStat = sortedStats[1]?.[0] || "health";

    // Difficulty
    let maxDiffScore = -1;
    let winnerDiff = "balanced";
    Object.entries(finalScores.difficulty).forEach(([diff, score]) => {
      const s = score as number;
      if (s > maxDiffScore) {
        maxDiffScore = s;
        winnerDiff = diff;
      }
    });

    const finalStats: Record<string, number> = {
      health: 8,
      strength: 8,
      agility: 8,
      charisma: 8,
      intelligence: 8
    };
    finalStats[primaryStat] += 2;
    finalStats[secondaryStat] += 1;

    setResult({
      className: winnerClass,
      primaryStat,
      secondaryStat,
      difficulty: winnerDiff,
      stats: finalStats
    });
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setScores({ classes: {}, stats: {}, difficulty: {} });
    setResult(null);
    setCopied(false);
  };

  const copyQuizResult = () => {
    if (!result) return;
    const info = CLASS_INFO[result.className];
    const diff = DIFFICULTY_INFO[result.difficulty];
    const text = `
클래스: ${info.name} (${info.category})
추천 난이도: ${diff.name}
[ 능력치 ]
건강: ❤️ ${result.stats.health}
근력: 💪 ${result.stats.strength}
민첩: 🦶 ${result.stats.agility}
매력: ✨ ${result.stats.charisma}
지능: 🧠 ${result.stats.intelligence}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatIcon = (stat: string) => {
    switch(stat) {
      case 'health': return "❤️";
      case 'strength': return "💪";
      case 'agility': return "🦶";
      case 'charisma': return "✨";
      case 'intelligence': return "🧠";
      default: return "";
    }
  };

  const getStatName = (stat: string) => {
    switch(stat) {
      case 'health': return "건강";
      case 'strength': return "근력";
      case 'agility': return "민첩";
      case 'charisma': return "매력";
      case 'intelligence': return "지능";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center p-4 md:p-8">
      {/* Header Doodle Decor */}
      <div className="absolute top-4 left-4 opacity-20 pointer-events-none animate-wiggle">
        <PenTool className="w-16 h-16" />
      </div>
      <div className="absolute top-10 right-10 opacity-20 pointer-events-none animate-wiggle" style={{ animationDelay: '1s' }}>
        <Skull className="w-20 h-20" />
      </div>

      <AnimatePresence mode="wait">
        {view === "main" && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center max-w-2xl w-full mt-12 md:mt-24"
          >
            <div className="relative mb-12">
              <h1 className="text-5xl md:text-7xl text-center mb-4 font-hand tracking-wider">
                공책 TRPG <br/> <span className="text-pencil-light">ฅ^•ﻌ•^ฅ</span>
              </h1>
              <div className="absolute -top-6 -right-8 rotate-12 opacity-50">
                <Sparkles className="w-12 h-12 text-pencil" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button 
                onClick={() => setView("quiz")}
                className="doodle-border p-8 bg-white hover:bg-eraser transition-colors doodle-shadow group"
              >
                <Dices className="w-12 h-12 mb-4 mx-auto group-hover:rotate-12 transition-transform" />
                <h2 className="text-3xl text-center font-hand">캐릭터 생성 문답</h2>
                <p className="text-center mt-2 opacity-60">나는 이 세계에서 어떤 영웅일까?</p>
              </button>

              <button 
                onClick={() => setView("world")}
                className="doodle-border p-8 bg-white hover:bg-eraser transition-colors doodle-shadow group"
              >
                <BookOpen className="w-12 h-12 mb-4 mx-auto group-hover:-rotate-12 transition-transform" />
                <h2 className="text-3xl text-center font-hand">세계관 설정</h2>
                <p className="text-center mt-2 opacity-60">하세은이 만든 에테리아 이야기</p>
              </button>
            </div>

            <div className="mt-16 text-center italic opacity-40 font-hand text-xl">
              "네 점심시간은 이제 내꺼야!!"
            </div>
          </motion.div>
        )}

        {view === "quiz" && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl bg-white doodle-border p-8 md:p-12 doodle-shadow relative mt-12"
          >
            <button 
              onClick={() => { setView("main"); resetQuiz(); }}
              className="absolute -top-4 -left-4 bg-white doodle-border p-2 hover:bg-eraser transition-colors z-20"
            >
              <ChevronLeft />
            </button>

            {!result ? (
              <div>
                <div className="mb-8 flex justify-between items-end">
                  <span className="font-hand text-2xl">질문 {quizStep + 1} / {QUESTIONS.length}</span>
                  <div className="w-32 h-2 bg-pencil/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pencil transition-all duration-300" 
                      style={{ width: `${((quizStep + 1) / QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <h2 className="text-3xl mb-12 font-hand leading-relaxed min-h-[80px]">
                  {QUESTIONS[quizStep].text}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {QUESTIONS[quizStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt.scores)}
                      className="w-full text-left p-6 doodle-border hover:bg-eraser transition-colors font-hand text-2xl"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-6 flex justify-center text-pencil">
                  {CLASS_INFO[result.className].icon}
                </div>
                <h2 className="text-2xl opacity-60 mb-2 font-hand">당신의 캐릭터 시트</h2>
                
                <div className="p-8 border-4 border-double border-pencil rounded-lg bg-paper/30 mb-8 relative">
                  <button 
                    onClick={copyQuizResult}
                    className="absolute top-4 right-4 p-2 doodle-border bg-white hover:bg-eraser transition-colors flex items-center gap-2 font-hand"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "복사됨!" : "복사하기"}
                  </button>

                  <div className="space-y-6 text-left">
                    <div>
                      <span className="font-hand text-xl opacity-50">클래스</span>
                      <h1 className="text-5xl font-hand text-pencil">
                        {CLASS_INFO[result.className].name} 
                        <span className="text-2xl ml-2 opacity-60">({CLASS_INFO[result.className].category})</span>
                      </h1>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(result.stats).map(([stat, val]) => (
                        <div key={stat} className="doodle-border p-3 bg-white text-center">
                          <div className="text-2xl mb-1">{getStatIcon(stat)}</div>
                          <div className="font-hand text-lg">{getStatName(stat)}</div>
                          <div className="font-hand text-3xl font-bold">{val}</div>
                          {stat === result.primaryStat && <div className="text-xs font-hand text-pencil-light">+2 보너스</div>}
                          {stat === result.secondaryStat && <div className="text-xs font-hand text-pencil-light">+1 보너스</div>}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-pencil/20">
                      <span className="font-hand text-xl opacity-50">추천 난이도</span>
                      <div className="flex items-center gap-4 mt-2">
                        {DIFFICULTY_INFO[result.difficulty].icon}
                        <div>
                          <div className="font-hand text-2xl">{DIFFICULTY_INFO[result.difficulty].name}</div>
                          <div className="font-hand text-lg opacity-60">{DIFFICULTY_INFO[result.difficulty].desc}</div>
                        </div>
                      </div>
                    </div>

                    <p className="font-hand text-2xl italic leading-relaxed pt-4 border-t border-pencil/20">
                      "{CLASS_INFO[result.className].desc}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={resetQuiz}
                    className="doodle-border px-8 py-3 hover:bg-eraser transition-colors font-hand text-xl"
                  >
                    다시 테스트하기
                  </button>
                  <button 
                    onClick={() => setView("world")}
                    className="doodle-border px-8 py-3 bg-pencil text-white hover:bg-pencil-light transition-colors font-hand text-xl"
                  >
                    세계관 더 알아보기
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {view === "world" && (
          <motion.div 
            key="world"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full max-w-4xl mt-8"
          >
            {/* World Sub Nav */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button 
                onClick={() => setView("main")}
                className="doodle-border px-4 py-2 bg-white hover:bg-eraser transition-colors font-hand text-xl"
              >
                <ChevronLeft className="inline w-5 h-5 mr-1" /> 뒤로
              </button>
              <button 
                onClick={() => setWorldSubView("story")}
                className={`doodle-border px-6 py-2 transition-colors font-hand text-xl ${worldSubView === 'story' ? 'bg-pencil text-white' : 'bg-white hover:bg-eraser'}`}
              >
                스토리
              </button>
              <button 
                onClick={() => setWorldSubView("compendium")}
                className={`doodle-border px-6 py-2 transition-colors font-hand text-xl ${worldSubView === 'compendium' ? 'bg-pencil text-white' : 'bg-white hover:bg-eraser'}`}
              >
                도감
              </button>
              <button 
                onClick={() => setWorldSubView("characters")}
                className={`doodle-border px-6 py-2 transition-colors font-hand text-xl ${worldSubView === 'characters' ? 'bg-pencil text-white' : 'bg-white hover:bg-eraser'}`}
              >
                등장인물
              </button>
              <button 
                onClick={() => setWorldSubView("creators")}
                className={`doodle-border px-6 py-2 transition-colors font-hand text-xl ${worldSubView === 'creators' ? 'bg-pencil text-white' : 'bg-white hover:bg-eraser'}`}
              >
                제작자
              </button>
            </div>

            <div className="bg-white doodle-border p-8 md:p-12 doodle-shadow min-h-[400px]">
              <AnimatePresence mode="wait">
                {worldSubView === "story" && (
                  <motion.div 
                    key="story"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Acts Sub Nav */}
                    <div className="flex flex-wrap justify-center gap-2 border-b-2 border-pencil/20 pb-4">
                      {["기본 배경", "1막", "2막", "3막"].map((act, idx) => (
                        <button
                          key={act}
                          onClick={() => setStoryAct(idx)}
                          className={`px-4 py-1 font-hand text-lg transition-all ${storyAct === idx ? 'underline decoration-double underline-offset-4 text-pencil' : 'opacity-40 hover:opacity-100'}`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>

                    <div className="min-h-[300px]">
                      {storyAct === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-hand text-2xl leading-relaxed space-y-6"
                        >
                          <h2 className="text-4xl mb-6 underline decoration-double">에테리아: 혼돈의 발레시아</h2>
                          <div className="p-6 bg-eraser/30 border-2 border-dashed border-pencil rounded-lg italic">
                            "이 이야기는 내가 중학교때 친구랑 만든거야, TRPG라는건데...그...그런말이있거든? TRPG는 최고의 그래픽을 가진게임이라고..! 왜냐면 상상력을 사용하니까.."
                          </div>
                          <div className="space-y-4">
                            <p>
                              발레시아 백작령은 제국의 서쪽 국경에 위치한 평화로운 지역입니다.
                            </p>
                            <p>
                              무슨 일인진 모르겠지만, 오크와 고블린, 오우거와 다크엘프까지... 
                              심상치 않은 일이 벌어지는 것 같군요.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {storyAct === 1 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-6"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <h3 className="text-3xl font-hand mb-4">1막: 서쪽 국경의 그림자</h3>
                              <p className="font-hand text-xl leading-relaxed mb-4">
                                1막의 배경은 한 '백작령'이고, 제국의 서쪽 변경에 위치하며 험준한 바위산맥과 인접해 있습니다.
                                하지만 무슨 일인지 오크들과 고블린들이 산맥을 넘어와(비밀!) 서쪽 끝 국경 마을들을 황폐화시킨 상태입니다.
                              </p>
                              
                              {/* Interactive Map */}
                              <div className="relative w-full aspect-[4/3] bg-paper doodle-border overflow-hidden cursor-crosshair group">
                                {/* Map Background Texture/Lines */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                
                                {ACT1_LOCATIONS.map((loc) => (
                                  <button
                                    key={loc.id}
                                    onMouseEnter={() => setHoveredLoc(loc)}
                                    onMouseLeave={() => setHoveredLoc(null)}
                                    className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-pencil hover:scale-150 transition-transform z-10"
                                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                  >
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-sm bg-white/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      {loc.name}
                                    </div>
                                  </button>
                                ))}

                                {/* Map Doodles */}
                                <div className="absolute top-10 left-10 opacity-20 rotate-12"><Trees className="w-12 h-12" /></div>
                                <div className="absolute bottom-20 right-20 opacity-20 -rotate-12"><MapIcon className="w-16 h-16" /></div>
                                <div className="absolute top-1/2 right-10 opacity-20"><Wind className="w-10 h-10" /></div>

                                {/* Hover Info Overlay */}
                                <AnimatePresence>
                                  {hoveredLoc && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="absolute bottom-4 left-4 right-4 bg-white/95 doodle-border p-4 doodle-shadow z-20 pointer-events-none"
                                    >
                                      <h4 className="text-2xl font-hand mb-1">{hoveredLoc.name}</h4>
                                      <p className="font-hand text-lg mb-2">{hoveredLoc.desc}</p>
                                      {hoveredLoc.situation && (
                                        <p className="font-hand text-md text-pencil-light mb-2 italic">상황: {hoveredLoc.situation}</p>
                                      )}
                                      <div className="flex flex-wrap gap-2">
                                        {hoveredLoc.characters.map((char, i) => (
                                          <span key={i} className="text-xs font-hand bg-eraser px-2 py-1 rounded border border-pencil/20">
                                            {char}
                                          </span>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <p className="text-center font-hand text-sm mt-2 opacity-40">지도의 점 위에 마우스를 올려보세요!</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {(storyAct === 2 || storyAct === 3) && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pencil/20 rounded-xl"
                        >
                          <PenTool className="w-16 h-16 mb-4 opacity-20 animate-bounce" />
                          <h3 className="text-3xl font-hand">아직 구상중이야..!</h3>
                          <p className="font-hand text-xl opacity-60 mt-2">조금만 더 기다려줘, 엄청난 반전이 있을 거니까!</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {worldSubView === "compendium" && (
                  <motion.div 
                    key="compendium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Compendium Sub Nav */}
                    <div className="flex flex-wrap justify-center gap-2 border-b-2 border-pencil/20 pb-4">
                      {[
                        { id: "magic", name: "마법 목록" },
                        { id: "classes", name: "클래스 & 하위 클래스" },
                        { id: "races", name: "종족" },
                        { id: "traits", name: "특성" }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setCompendiumSubView(sub.id as CompendiumSubView)}
                          className={`px-4 py-1 font-hand text-lg transition-all ${compendiumSubView === sub.id ? 'underline decoration-double underline-offset-4 text-pencil' : 'opacity-40 hover:opacity-100'}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>

                    {compendiumSubView === "magic" ? (
                      <div className="space-y-6">
                        {/* Magic Level Tabs */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            { id: "cantrip", name: "소마법" },
                            { id: "level1", name: "1레벨" },
                            { id: "level2", name: "2레벨" },
                            { id: "level3", name: "3레벨" },
                            { id: "level4", name: "4레벨" },
                            { id: "level5", name: "5레벨" },
                            { id: "level6", name: "6레벨" }
                          ].map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => setMagicLevel(lvl.id)}
                              className={`px-3 py-1 font-hand text-base border-b-2 transition-all ${magicLevel === lvl.id ? 'border-pencil text-pencil' : 'border-transparent opacity-40 hover:opacity-100'}`}
                            >
                              {lvl.name}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {SPELLS[magicLevel]?.length > 0 ? (
                            SPELLS[magicLevel].map((spell, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 border-2 border-pencil/10 rounded-lg bg-white/50 hover:bg-white transition-colors doodle-shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-pencil/40" />
                                    <h4 className="text-xl font-hand text-pencil">{spell.name}</h4>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => copyToClipboard(spell.name, "이름이")}
                                      className="px-2 py-0.5 text-[10px] font-hand border border-pencil/20 rounded hover:bg-pencil hover:text-white transition-colors"
                                      title="이름 복사"
                                    >
                                      이름 복사
                                    </button>
                                    <button 
                                      onClick={() => copyToClipboard(spell.desc, "내용이")}
                                      className="px-2 py-0.5 text-[10px] font-hand border border-pencil/20 rounded hover:bg-pencil hover:text-white transition-colors"
                                      title="내용 복사"
                                    >
                                      내용 복사
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const fullText = `[${spell.name}]\n${spell.damage ? `데미지: ${spell.damage}\n` : ''}${spell.desc}`;
                                        copyToClipboard(fullText, "전체 내용이");
                                      }}
                                      className="px-2 py-0.5 text-[10px] font-hand border border-pencil/20 rounded hover:bg-pencil hover:text-white transition-colors"
                                      title="전체 복사"
                                    >
                                      전체 복사
                                    </button>
                                  </div>
                                </div>
                                {spell.damage && (
                                  <p className="font-hand text-sm text-red-800/60 mb-1">
                                    <span className="font-bold">데미지:</span> {spell.damage}
                                  </p>
                                )}
                                <p className="font-hand text-base opacity-80 leading-relaxed">
                                  {spell.desc}
                                </p>
                              </motion.div>
                            ))
                          ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30">
                              <PenTool className="w-12 h-12 mb-2 animate-bounce" />
                              <p className="font-hand text-xl">아직 기록되지 않은 마법이야!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : compendiumSubView === "classes" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {CLASSES.map((cat, catIdx) => (
                          <motion.div
                            key={catIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIdx * 0.1 }}
                            className="space-y-4"
                          >
                            <h3 className="text-2xl font-hand text-pencil border-b-2 border-pencil/20 pb-1 flex items-center gap-2">
                              <Shield className="w-6 h-6 opacity-40" />
                              {cat.category}
                            </h3>
                            <div className="space-y-6 pl-4">
                              {cat.classes.map((cls, clsIdx) => (
                                <div key={clsIdx} className="relative">
                                  <div className="absolute -left-4 top-3 w-3 h-[2px] bg-pencil/20"></div>
                                  <h4 className="text-xl font-hand text-pencil mb-2">{cls.name}</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {cls.subClasses.map((sub, subIdx) => (
                                      <span 
                                        key={subIdx}
                                        className="px-3 py-1 bg-eraser/50 doodle-border rounded-full font-hand text-sm hover:bg-eraser transition-colors"
                                      >
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : compendiumSubView === "races" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {RACES.map((race, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="p-4 bg-white/50 doodle-border rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white transition-all hover:-translate-y-1 doodle-shadow-sm"
                          >
                            <div className="w-10 h-10 bg-eraser rounded-full flex items-center justify-center opacity-40">
                              <Users className="w-6 h-6" />
                            </div>
                            <span className="font-hand text-xl text-pencil">{race}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-pencil/20 rounded-xl">
                        <BookOpen className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
                        <h3 className="text-3xl font-hand">
                          {compendiumSubView === "traits" && "특성"}
                        </h3>
                        <p className="font-hand text-xl opacity-60 mt-2">이 부분은 나중에 세부적으로 채워 넣을 거야!</p>
                        <p className="font-hand text-lg opacity-40 mt-1 italic">"공책 여백이 부족해서... 다음 점심시간에 계속!"</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {worldSubView === "characters" && (
                  <motion.div 
                    key="chars"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-12"
                  >
                    {/* 피난민 캠프 */}
                    <section>
                      <h3 className="text-4xl font-hand mb-6 border-b-2 border-pencil/20 pb-2">피난민 캠프</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CharacterCard 
                          name="도르칸" 
                          role="피난민 우두머리 / 용병"
                          desc="폐허가 된 마을에 거주중이던 용병. 오크들의 마을 침공 때 마을 사람들의 대피와 호위를 맡으며 실질적인 피난민들의 우두머리가 되었다."
                        />
                        <CharacterCard 
                          name="하르벤" 
                          role="이전 촌장"
                          desc="폐허가 된 마을의 이전 촌장."
                        />
                      </div>
                    </section>

                    {/* 발레시아 백작령 */}
                    <section>
                      <h3 className="text-4xl font-hand mb-6 border-b-2 border-pencil/20 pb-2">발레시아 백작령</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CharacterCard 
                          name="카스파르 백작" 
                          role="발레시아 백작"
                          desc="발레시아 백작령의 백작. 우유부단하다는 평가가 많다."
                        />
                        <CharacterCard 
                          name="에이든 발레시아" 
                          role="백작령 후계자 / 기사"
                          desc="카스파르의 장남. 모범적인 기사도 정신을 가진 기사라는 평가가 많다."
                        />
                        <CharacterCard 
                          name="알레시아 발레시아" 
                          role="백작부인"
                          desc="인자하다는 평가가 많은 발레시아 백작부인."
                        />
                        <CharacterCard 
                          name="루시아 발레시아" 
                          role="백작 영애"
                          desc="아름답지만 세상물정을 모른다는 평가가 있다."
                        />
                      </div>
                    </section>

                    {/* 세력/단체 */}
                    <section>
                      <h3 className="text-4xl font-hand mb-6 border-b-2 border-pencil/20 pb-2">주요 세력 및 단체</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 doodle-border bg-white/50">
                          <h3 className="text-3xl font-hand mb-2">그림락 상업길드</h3>
                          <p className="font-hand text-lg mb-4">바위산맥에서 "상업" 활동을 하는 길드이다.</p>
                          <div className="p-3 bg-pencil/5 rounded italic font-hand text-lg">
                            - 늙은이의 조언 - "나라면 바위산맥을 혼자 가진않을걸세."
                          </div>
                        </div>
                        <div className="p-6 doodle-border bg-white/50">
                          <h3 className="text-3xl font-hand mb-2">브라이어 도적단</h3>
                          <p className="font-hand text-lg">악명높은 발레시아 백작령의 로즈우드 숲에서 활동하는 도적단. 그림락의 상단을 자주 노려 둘의 사이가 좋지 않다는 소문이 있다.</p>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {worldSubView === "creators" && (
                  <motion.div 
                    key="creators"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-12"
                  >
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-eraser doodle-border rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                          <img 
                            src="https://krpinot.org/PR/trpg%EB%A1%9C.webp" 
                            alt="하세은 프로필" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h3 className="text-3xl font-hand">하세은</h3>
                        <p className="font-hand text-xl opacity-60">메인설정, 스토리</p>
                        <p className="mt-4 font-hand text-lg max-w-[200px]">"고등학교 가도 TRPG는 계속할 거야!"</p>
                      </div>
                      <div className="text-5xl font-hand opacity-20">&</div>
                      <div className="text-center">
                        <div className="w-32 h-32 bg-eraser doodle-border rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Ghost className="w-16 h-16 opacity-30" />
                        </div>
                        <h3 className="text-3xl font-hand">???</h3>
                        <p className="font-hand text-xl opacity-60">시스템 설계, 밸런스</p>
                        <p className="mt-4 font-hand text-lg max-w-[200px]">"가끔은 기억하려나..?"</p>
                      </div>
                    </div>
                    <div className="mt-8 p-6 bg-pencil text-white doodle-border font-hand text-xl text-center">
                      "2020년 중학교 뒷자리에서 시작된 서사시!!"
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random Doodles */}
      <div className="fixed bottom-10 left-10 opacity-10 pointer-events-none pencil-sketch">
        <Star className="w-12 h-12" />
      </div>
      <div className="fixed bottom-20 right-20 opacity-10 pointer-events-none pencil-sketch">
        <Wind className="w-16 h-16" />
      </div>
      <div className="fixed top-1/4 left-10 opacity-10 pointer-events-none pencil-sketch -rotate-12">
        <Sword className="w-14 h-14" />
      </div>
      <div className="fixed top-1/3 right-12 opacity-10 pointer-events-none pencil-sketch rotate-12">
        <Shield className="w-16 h-16" />
      </div>
      <div className="fixed bottom-1/4 right-8 opacity-10 pointer-events-none pencil-sketch -rotate-6">
        <Flame className="w-20 h-20" />
      </div>
      <div className="fixed bottom-1/3 left-12 opacity-10 pointer-events-none pencil-sketch rotate-6">
        <Ghost className="w-14 h-14" />
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-pencil text-paper mt-24 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-hand text-4xl">공책 TRPG</div>
          <div className="flex gap-8 font-hand text-xl">
            <FooterLink text="이용약관" tooltip="화내지않기! 몰입하기! 재밌게하기! 약속?!" />
            <FooterLink text="개인정보처리방침" tooltip="그런건업서!" />
            <FooterLink text="문의하기" tooltip="그런건업서!" />
          </div>
          <div className="font-hand text-lg opacity-60">© 2022 공책 TRPG. All rights reserved.</div>
        </div>
      </footer>
      <Toaster position="bottom-center" />
    </div>
  );
}

function FooterLink({ text, tooltip }: { text: string, tooltip: string }) {
  return (
    <div className="relative group">
      <a href="#" className="hover:text-eraser transition-colors underline decoration-wavy">
        {text}
      </a>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] p-2 bg-white text-pencil doodle-border text-sm font-hand doodle-shadow z-50">
        {tooltip}
      </div>
    </div>
  );
}

function CharacterCard({ name, role, desc }: { name: string, role: string, desc: string }) {
  return (
    <div className="p-6 doodle-border bg-white hover:bg-eraser transition-colors">
      <h3 className="text-3xl font-hand mb-1">{name}</h3>
      <p className="text-xl font-hand text-pencil-light mb-4">{role}</p>
      <p className="font-hand text-lg leading-relaxed">{desc}</p>
    </div>
  );
}
