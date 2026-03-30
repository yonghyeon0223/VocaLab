# Sprint 03 — 프로필 설정

**기간**: Sprint 03
**목표**: 첫 로그인 후 필수 프로필 설정을 완료한다. 모든 핵심 기능은 프로필 설정 완료 후에만 접근 가능하다.

---

## 📋 요약

이메일 인증 완료 후 유저는 프로필 설정 플로우를 거친다. 닉네임 → 난이도 안내 → 문장 평가 (lv.1~10 전체) → 결과 확인 → 학습 목적 선택 → 완료 순서로 진행된다. 완료 전까지 메인 앱에 진입할 수 없다. 프로필은 설정 화면에서 언제든지 수정 가능하며, 모든 변경사항은 자동 저장된다.

---

## 화면 순서 및 플로우
```
[회원가입 완료 / 로그인]
        ↓
profileCompleted === false
        ↓
[화면 1] 닉네임 입력
        ↓
[화면 2] 난이도 안내
        ↓
[화면 3] 문장 평가 (lv.1 ~ lv.10, 앞뒤 이동 가능)
        ↓
[화면 4] 결과 확인
        ↓
[화면 5] 학습 목적 선택
        ↓
[화면 6] 완료
        ↓
profileCompleted === true → 메인 앱 진입
```

---

## 핵심 레벨 개념
```typescript
type RatingValue = 'easy' | 'appropriate' | 'hard' | 'alien'

type LevelRatings = {
  [level: number]: RatingValue  // 1~10 각 레벨의 평가 기록
}

type UserLevels = {
  easyLevel: number,           // 1~10, 기초 예문/문제에 사용
  activeLevel: number,         // 1~10, 학습 예문/문제에 사용
  hardLevel: number,           // 1~10, 심화 예문/문제에 사용
  levelRatings: LevelRatings,  // 전체 평가 기록 보존
}
```

### 계산 방식
```typescript
const easyLevels   = levelRatings에서 'easy'로 평가한 레벨 배열
const activeLevels = levelRatings에서 'appropriate'로 평가한 레벨 배열
const hardLevels   = levelRatings에서 'hard' 또는 'alien'으로 평가한 레벨 배열

// 1. easyLevel: 쉽다고 평가한 것 중 최고. 없으면 폴백 1
easyLevel = easyLevels.length > 0
  ? Math.max(...easyLevels)
  : 1

// 2. hardLevel: 힘들어요/외계어 중 최솟값. 없으면 폴백 10
hardLevel = hardLevels.length > 0
  ? Math.min(...hardLevels)
  : 10

// 3. activeLevel: 적절한 레벨들의 중간값. 없으면 폴백 min(easyLevel+1, hardLevel)
//    hardLevel을 초과할 수 없음
activeLevel = activeLevels.length > 0
  ? Math.floor((Math.min(...activeLevels) + Math.max(...activeLevels)) / 2)
  : Math.min(easyLevel + 1, hardLevel)
```

### 레벨 관계
```
easyLevel ≤ activeLevel ≤ hardLevel
세 값이 같아도 유효 (역전만 방지)
```

### 레벨별 수준 레이블
```
lv.1  → 초등 1~2학년
lv.2  → 초등 3~4학년
lv.3  → 초등 5~6학년
lv.4  → 중학 1학년
lv.5  → 중학 2~3학년
lv.6  → 고등 1학년
lv.7  → 고등 2학년
lv.8  → 고등 3학년 / 수능
lv.9  → 수능 고난도
lv.10 → 학술 논문
```

### 예문 기반
```
lv.1~3  → 초등 교과서 기반
lv.4~5  → 중학 교과서 기반
lv.6~7  → 고등 교과서 기반
lv.8~9  → 수능 기출 기반
lv.10   → 실제 학술 논문 기반
```

---

## 화면별 상세 룰

### 화면 1 — 닉네임

**UI**
- 타이틀: "반가워요! 뭐라고 부를까요?"
- placeholder: "예: 민준"
- 다음 버튼

**룰**
- 최소 1자, 최대 10자
- 공백만으로 구성 불가 (앞뒤 trim 처리)
- 유효하지 않으면 다음 버튼 비활성

---

### 화면 2 — 난이도 안내

**UI**
- 타이틀: "딱 맞는 예문을 찾아드릴게요"
- 문맥 학습 원리 박스 (왼쪽 accent 보더):
  - 헤드라인: "VocaLab은 문맥 속에서 단어를 익혀요"
  - 본문: "너무 쉬우면 기억에 안 남고, 너무 어려우면 뜻이 파악되지 않아요. 딱 맞는 예문이어야 단어가 자연스럽게 머릿속에 남아요."
- 부제목: "문장 몇 개를 보고 느낌을 알려주세요."
- 처음 만날 때 / 실전 적용 카드 (읽기·듣기·말하기·쓰기 pill)
- "문장 보러 가기" 버튼

---

### 화면 3 — 문장 평가

**UI**
- 상단: "lv.N — {수준 레이블}" (예: "lv.4 — 중학 1학년 수준")
- 진행 바: 1~10 중 현재 위치 표시
- 문장 카드 (기본 1개 표시)
- "다른 예문 보기" 버튼 → 같은 레벨의 다른 문장으로 교체 (최대 3개 순환)
- 4지선다 평가 버튼
  - 바로 이해돼요 (초록 #4caf7d)
  - 조금 생각하면 돼요 (보라 #6c63ff)
  - 뜻 파악이 힘들어요 (주황 #e8a838)
  - 외계어예요 (빨강 #e05252)
- 이전 / 다음 네비게이션 버튼
- 이미 평가한 레벨은 선택한 버튼이 하이라이트된 상태로 표시
- lv.10 평가 완료 시 "결과 보기" 버튼 활성

**역전 방지 (Inversion Prevention)**

현재 레벨에서 선택 가능한 버튼은 이전 레벨의 선택보다 같거나 어려운 것만 허용.
```
rating 순서 (쉬운 것 → 어려운 것)
  easy → appropriate → hard → alien

lv.N-1의 rating이 'appropriate'이면
  lv.N에서 선택 가능: appropriate / hard / alien
  lv.N에서 선택 불가: easy (비활성)

lv.N-1의 rating이 'hard'이면
  lv.N에서 선택 가능: hard / alien
  lv.N에서 선택 불가: easy / appropriate (비활성)
```

**뒤로 가서 수정할 때**
```
lv.3 평가를 'hard' → 'easy'로 수정
        ↓
lv.4 이후 평가 중 역전 방지 룰을 위반하는 것이 있으면 → 해당 레벨 평가 초기화
lv.4 이후 기존 평가가 룰을 여전히 만족하면 → 유지
```

---

### 화면 4 — 결과 확인

**UI**
- 타이틀: "학습 구간이 설정됐어요"
- 바 차트: lv.1~10 각각 평가 색상으로 표시
  - easy → 초록
  - appropriate → 보라
  - hard → 주황
  - alien → 빨강
- 결과 카드 3개
  - 처음 만날 때: "lv.{easyLevel} — {수준 레이블}"
  - 실전 적용: "lv.{activeLevel} — {수준 레이블}"
  - 심화: "lv.{hardLevel} — {수준 레이블}"
- 폴백 적용 시 안내 메시지 표시
- "다음" 버튼

**폴백 안내 메시지**

| 케이스 | 조건 | 메시지 |
|--------|------|--------|
| easyLevel 폴백 | easy 없음 → lv.1 | "바로 이해되는 구간이 없어서 가장 낮은 레벨로 시작할게요." |
| activeLevel 폴백 | appropriate 없음 → min(easyLevel+1, hardLevel) | "적절한 구간이 따로 없어서 기초와 심화 사이로 설정할게요." |
| hardLevel 폴백 | hard/alien 없음 → lv.10 | "어려운 구간이 없어서 가장 높은 레벨로 설정할게요." |

---

### 화면 5 — 학습 목적

**UI**
- 타이틀: "어떤 영어를 배우고 싶어요?"
- 부제목: "최대 5개까지 고를 수 있어요."
- 안내 문구 (부제목 아래 작게):
  "선택한 목적에 맞는 예문이 더 자주 출제돼요."
- 그룹별 칩 + 카운터

**카테고리 목록**
```
일상 · 생활 (3)
  생활 영어, 실전 회화, 여행 영어

학교 · 수험 (4)
  교과서 내신, 수능 준비, 편입 영어, SAT

공인 시험 (6)
  TOEIC, TOEFL, IELTS, TEPS, OPIc, GRE

전공 · 직군 (8)
  비즈니스, 금융 및 경제, 법률, 의학 및 보건,
  IT 및 개발, 과학 연구, 공학, 예술 및 디자인

영미권 콘텐츠 (11)
  미드, 영화, 게임, 커뮤니티, 스포츠, 시사 및 뉴스,
  팝송, 유튜브, 팟캐스트, 영어 원서, 다큐멘터리
```

**학습 목적과 예문 출제 빈도**
- 선택한 목적과 관련된 예문의 출제 빈도가 높아짐
- 선택하지 않은 목적의 예문도 출제될 수 있음 (완전 필터링 아님)
- 목적이 많을수록 다양한 예문이 고르게 출제됨

**룰**
- 최소 1개 필수 → 0개일 때 다음 버튼 비활성
- 최대 5개 → 초과 시 나머지 칩 비활성
- 마지막 1개 칩 해제 불가

---

### 화면 6 — 완료

**UI**
- 닉네임 아바타 (첫 글자)
- 타이틀: "다 됐어요, {닉네임}님!"
- 학습 목적 태그 나열
- 권장 학습 난이도
  - 처음 만날 때: lv.{easyLevel} — {수준 레이블}
  - 실전 적용: lv.{activeLevel} — {수준 레이블}
  - 심화: lv.{hardLevel} — {수준 레이블}
- 안내 문구: "프로필에서 난이도를 직접 조정하거나 테스트를 다시 받을 수 있어요."
- "첫 단어 세트 만들기" / "나중에 할게요" 버튼

**룰**
- 두 버튼 모두 profileCompleted: true 업데이트 후 메인 앱 진입

---

## 프로필 수정 페이지

### 탭 구조: 기본 | 학습 목적 | 난이도

### 기본 탭
- 닉네임 수정, 이메일 표시, 비밀번호 변경, 로그아웃

### 학습 목적 탭
- 화면 5와 동일한 UI 및 룰 (최소 1개, 최대 5개)

### 난이도 탭
- easyLevel / activeLevel / hardLevel lv.1~10 버튼으로 직접 설정
- easyLevel ≤ activeLevel ≤ hardLevel 강제 (같은 값 허용, 역전만 방지)
- 버튼 선택 시 해당 레벨 예문 미리보기 즉시 업데이트
- "난이도 테스트 다시 받기" → 화면 3으로 이동

### 자동 저장
- 저장 버튼 없음
- 탭 전환 / 화면 이탈 시 PATCH 요청
- 실패 시 토스트: "저장에 실패했어요. 다시 시도해주세요."

---

## DB 모델

### `users` 컬렉션 프로필 필드
```typescript
nickname: string,
purposes: string[],       // 1~5개
easyLevel: number,        // 1~10
activeLevel: number,      // 1~10
hardLevel: number,        // 1~10
levelRatings: {           // lv.1~10 전체 평가 기록
  [level: number]: 'easy' | 'appropriate' | 'hard' | 'alien'
},
profileCompleted: boolean,
```

### `testSentences` 컬렉션
```typescript
type TestSentence = {
  _id: ObjectId,
  level: number,       // 1~10
  text: string,        // 영어 원문
  translation: string  // 한국어 번역
}
```

---

## 시드 데이터 (레벨당 3개, 총 30개)
```typescript
// server/src/seeds/testSentences.ts

const testSentences = [

  // lv.1 — 초등 1~2학년 (초등 교과서 기반)
  { level: 1, text: "I have a cat. It is cute.", translation: "나는 고양이가 있다. 그것은 귀엽다." },
  { level: 1, text: "This is my bag. It is red.", translation: "이것은 내 가방이다. 그것은 빨간색이다." },
  { level: 1, text: "I like apples. They are sweet.", translation: "나는 사과를 좋아한다. 그것들은 달다." },

  // lv.2 — 초등 3~4학년 (초등 교과서 기반)
  { level: 2, text: "I usually wake up at seven and eat breakfast with my family.", translation: "나는 보통 7시에 일어나서 가족과 함께 아침을 먹는다." },
  { level: 2, text: "My favorite subject is science because I like doing experiments.", translation: "내가 가장 좋아하는 과목은 과학인데, 실험하는 것을 좋아하기 때문이다." },
  { level: 2, text: "Last weekend, we went to the park and had a picnic with our neighbors.", translation: "지난 주말에 우리는 공원에 가서 이웃들과 소풍을 즐겼다." },

  // lv.3 — 초등 5~6학년 (초등 교과서 기반)
  { level: 3, text: "If you want to stay healthy, you should exercise regularly and eat balanced meals.", translation: "건강을 유지하고 싶다면 규칙적으로 운동하고 균형 잡힌 식사를 해야 한다." },
  { level: 3, text: "My brother, who is three years older than me, is studying at a university in Seoul.", translation: "나보다 세 살 많은 내 형은 서울의 한 대학교에서 공부하고 있다." },
  { level: 3, text: "When the bell rang, all the students rushed out of the classroom to enjoy their lunch break.", translation: "종이 울리자 모든 학생들이 점심시간을 즐기기 위해 교실 밖으로 뛰쳐나갔다." },

  // lv.4 — 중학 1학년 (중학 교과서 기반)
  { level: 4, text: "Although she had never traveled abroad before, she adapted to the new culture more quickly than anyone had expected.", translation: "그녀는 전에 한 번도 해외여행을 한 적이 없었지만, 누구도 예상하지 못한 것보다 더 빨리 새로운 문화에 적응했다." },
  { level: 4, text: "The invention of the smartphone has changed the way people communicate, work, and spend their leisure time.", translation: "스마트폰의 발명은 사람들이 소통하고, 일하고, 여가 시간을 보내는 방식을 바꾸어 놓았다." },
  { level: 4, text: "It is important that we protect the environment not only for ourselves but also for future generations who will inherit the earth.", translation: "우리 자신뿐만 아니라 지구를 물려받을 미래 세대를 위해서도 환경을 보호하는 것이 중요하다." },

  // lv.5 — 중학 2~3학년 (중학 교과서 기반)
  { level: 5, text: "Despite the rapid development of technology, many people argue that face-to-face communication remains irreplaceable in building meaningful relationships.", translation: "기술의 급격한 발전에도 불구하고, 많은 사람들은 의미 있는 관계를 형성하는 데 있어 대면 소통이 여전히 대체 불가능하다고 주장한다." },
  { level: 5, text: "The rise of social media has blurred the boundary between public and private life, raising serious concerns about personal privacy.", translation: "소셜 미디어의 부상은 공적 생활과 사적 생활의 경계를 흐려놓았으며, 개인 프라이버시에 대한 심각한 우려를 불러일으키고 있다." },
  { level: 5, text: "Volunteering not only benefits the community but also provides individuals with a sense of purpose and an opportunity to develop new skills.", translation: "자원봉사는 지역 사회에 이로울 뿐만 아니라, 개인에게 목적 의식과 새로운 기술을 개발할 기회를 제공한다." },

  // lv.6 — 고등 1학년 (고등 교과서 기반)
  { level: 6, text: "It is not until we lose something that we truly appreciate its value, a truth that applies equally to relationships, health, and opportunities.", translation: "무언가를 잃고 나서야 비로소 그 가치를 진정으로 깨닫게 되는데, 이 진실은 인간관계, 건강, 기회에 똑같이 적용된다." },
  { level: 6, text: "The way in which a society treats its most vulnerable members is often considered a reflection of its overall level of civilization and moral development.", translation: "한 사회가 가장 취약한 구성원들을 대하는 방식은 흔히 그 사회의 전반적인 문명 수준과 도덕적 발전의 반영으로 여겨진다." },
  { level: 6, text: "While globalization has created unprecedented opportunities for economic growth, it has simultaneously widened the gap between the wealthy and the poor in many regions.", translation: "세계화는 경제 성장을 위한 전례 없는 기회를 창출한 반면, 많은 지역에서 빈부 격차를 동시에 심화시켰다." },

  // lv.7 — 고등 2학년 (고등 교과서 기반)
  { level: 7, text: "The paradox of choice suggests that an abundance of options, rather than enhancing our sense of freedom, can ultimately lead to greater anxiety and dissatisfaction.", translation: "선택의 역설은 풍부한 선택지가 자유에 대한 우리의 감각을 높이는 대신, 궁극적으로 더 큰 불안과 불만족으로 이어질 수 있다고 제안한다." },
  { level: 7, text: "Cognitive biases, which are systematic patterns of deviation from rationality in judgment, often cause individuals to draw inaccurate conclusions from the information available to them.", translation: "인지 편향은 판단에서 합리성으로부터의 체계적인 이탈 패턴으로, 흔히 개인이 이용 가능한 정보로부터 부정확한 결론을 도출하게 만든다." },
  { level: 7, text: "The extent to which early childhood experiences shape an individual's personality and cognitive development has been a central question in both psychology and education for decades.", translation: "초기 아동 경험이 개인의 성격과 인지 발달을 형성하는 정도는 수십 년간 심리학과 교육학 모두에서 핵심 질문이었다." },

  // lv.8 — 고등 3학년 / 수능 (수능 기출 기반)
  { level: 8, text: "The assumption that scientific progress is inherently linear and cumulative has been challenged by historians of science who argue that paradigm shifts often involve the abandonment of previously accepted truths.", translation: "과학적 진보가 본질적으로 선형적이고 누적적이라는 가정은, 패러다임 전환이 흔히 이전에 받아들여진 진실의 포기를 수반한다고 주장하는 과학사학자들에 의해 도전받아 왔다." },
  { level: 8, text: "While empathy is widely regarded as a virtue that promotes prosocial behavior, recent research suggests that it can also lead to biased decision-making by causing individuals to prioritize the needs of those they identify with over those of strangers.", translation: "공감은 친사회적 행동을 촉진하는 미덕으로 널리 여겨지지만, 최근 연구는 공감이 편향된 의사결정으로 이어질 수도 있음을 시사한다." },
  { level: 8, text: "The notion that language merely reflects reality, rather than actively shaping it, has been fundamentally undermined by research in cognitive linguistics demonstrating that the structure of a language influences how its speakers perceive and categorize experience.", translation: "언어가 현실을 단순히 반영한다는 개념은, 언어의 구조가 화자가 경험을 인식하고 범주화하는 방식에 영향을 미친다는 것을 보여주는 인지언어학 연구에 의해 근본적으로 훼손되었다." },

  // lv.9 — 수능 고난도 (수능 기출 기반)
  { level: 9, text: "The epistemological tension between universalist claims in moral philosophy and the particularist commitments of cultural relativism cannot be resolved through empirical inquiry alone, as it ultimately concerns the normative foundations upon which cross-cultural ethical evaluation is predicated.", translation: "도덕 철학의 보편주의적 주장과 문화적 상대주의의 특수주의적 헌신 사이의 인식론적 긴장은 경험적 탐구만으로는 해소될 수 없는데, 이는 궁극적으로 문화 간 윤리적 평가가 전제되는 규범적 토대에 관한 것이기 때문이다." },
  { level: 9, text: "The recursive entanglement of observer and observed within ethnographic methodology necessitates a reflexive epistemological stance that acknowledges the co-constitutive role of the researcher in the production of knowledge.", translation: "민족지학적 방법론 내에서 관찰자와 관찰 대상의 재귀적 얽힘은 지식 생산에 있어 연구자의 공동구성적 역할을 인정하는 반성적 인식론적 입장을 필요로 한다." },
  { level: 9, text: "Poststructuralist critiques of the Enlightenment subject have demonstrated that the autonomous, self-constituting individual presupposed by liberal political theory is itself a historically contingent discursive construction whose universalist pretensions serve to naturalize particular configurations of power.", translation: "계몽주의적 주체에 대한 후기구조주의적 비판은 자유주의 정치이론이 전제하는 자율적 개인이 그 자체로 역사적으로 우연한 담론적 구성물이며, 그것의 보편주의적 주장이 특정한 권력 배치를 자연화하는 데 기여함을 보여주었다." },

  // lv.10 — 학술 논문 (실제 학술 논문 기반)
  { level: 10, text: "The proliferation of algorithmic decision-making systems across institutional domains has engendered significant normative concerns regarding accountability, transparency, and the entrenchment of systemic bias within ostensibly neutral computational frameworks.", translation: "제도적 영역 전반에 걸친 알고리즘 의사결정 시스템의 확산은 책임성, 투명성, 그리고 표면상 중립적인 계산 프레임워크 내에 체계적 편향이 고착화되는 것에 관한 상당한 규범적 우려를 불러일으켰다." },
  { level: 10, text: "Contrary to the reductionist paradigm that has long dominated biomedical research, emerging evidence suggests that complex psychiatric disorders arise from dynamic interactions among genetic predispositions, epigenetic modifications, and socioenvironmental stressors across developmental trajectories.", translation: "오랫동안 생의학 연구를 지배해 온 환원주의적 패러다임과 달리, 새로운 증거들은 복잡한 정신 장애가 발달 궤적 전반에 걸쳐 유전적 소인, 후성 유전학적 변형, 사회환경적 스트레스 요인 간의 역동적 상호작용으로부터 발생한다는 것을 시사한다." },
  { level: 10, text: "The ontological indeterminacy inherent in quantum mechanical systems fundamentally precludes the assignment of definite values to conjugate observables prior to measurement, thereby challenging classical conceptions of physical reality as mind-independent and causally determinate.", translation: "양자역학적 시스템에 내재된 존재론적 불확정성은 측정 이전에 켤레 관측량에 확정적 값을 할당하는 것을 근본적으로 불가능하게 하며, 이로써 물리적 실재를 정신 독립적이고 인과적으로 결정된 것으로 보는 고전적 개념에 도전한다." },

]
```

---

## DB 업데이트 시점

| 액션 | 업데이트 필드 |
|------|-------------|
| 화면 1 완료 | `nickname` |
| 화면 4 완료 | `easyLevel`, `activeLevel`, `hardLevel`, `levelRatings` |
| 화면 5 완료 | `purposes` |
| 화면 6 버튼 클릭 (둘 다) | `profileCompleted: true` |
| 프로필 수정 자동 저장 | 변경된 필드만 PATCH |

---

## API 엔드포인트

### PATCH /api/users/profile
```
미들웨어: authenticate
요청: { nickname?, purposes?, easyLevel?, activeLevel?, hardLevel?, levelRatings? }
처리: 전달된 필드만 업데이트
성공: 200 { success: true, data: { user } }
실패: 400 닉네임이 공백이거나 10자 초과
      400 purposes가 0개 or 5개 초과
      400 레벨 값이 1~10 범위를 벗어남
      400 easyLevel > hardLevel (역전 방지, 같은 값은 허용)
```

### PATCH /api/users/profile/complete
```
미들웨어: authenticate
요청: 없음
처리: profileCompleted: true 업데이트
성공: 200 { success: true }
```

### GET /api/sentences/test
```
미들웨어: authenticate
요청: ?level=N (1~10)
성공: 200 { success: true, data: TestSentence[] } (해당 레벨 3개 반환)
```

---

## 시드 스크립트

`server/src/seeds/testSentences.ts` 에 위 30개 문장 시드 데이터 작성.
서버 최초 실행 시 `testSentences` 컬렉션이 비어있으면 자동 삽입.

---

## 완료 조건 (Definition of Done)

- profileCompleted === false 유저는 메인 앱 진입 불가 확인
- lv.1~10 전체 평가 후 결과 화면으로 이동 확인
- 앞뒤 네비게이션으로 이전 레벨 재평가 가능 확인
- 역전 방지: 이전 레벨 선택보다 쉬운 평가 버튼 비활성 확인
- 뒤로 가서 수정 시 이후 레벨 유효성 재검증 및 초기화 확인
- "다른 예문 보기" 버튼으로 같은 레벨 다른 문장 표시 확인 (최대 3개 순환)
- easyLevel / activeLevel / hardLevel 계산 및 폴백 처리 정확성 확인
- easyLevel ≤ activeLevel ≤ hardLevel 관계 유지 확인 (같은 값 허용)
- levelRatings 전체 기록 DB 저장 확인
- 학습 목적 0개일 때 다음 버튼 비활성 확인
- 학습 목적 5개 선택 시 나머지 칩 비활성 확인
- 마지막 1개 칩 해제 불가 확인
- 두 완료 버튼 모두 profileCompleted: true 업데이트 확인
- testSentences 시드 데이터 30개 DB 저장 확인
- 프로필 수정 자동 저장 확인 (탭 전환 / 화면 이탈)
- 저장 실패 시 토스트 메시지 표시 확인
- 난이도 탭 역전 방지 강제 확인
- "난이도 테스트 다시 받기" → 화면 3으로 이동 확인

---

## 이번 스프린트에서 하지 않는 것

- AI 예문 생성 연동 (문장은 시드 데이터로 시작)
- 학습 목적별 예문 출제 빈도 가중치 로직 (→ 단어 세트 구현 스프린트에서)
- 푸시 알림
- 소셜 로그인

---

## 참고 정보

- **GitHub 레포**: https://github.com/yonghyeon0223/VocaLab.git
- **디자인 방향**: 다크모드 기본, 포인트 컬러 #6c63ff
- **이전 스프린트**: Sprint 02 완료