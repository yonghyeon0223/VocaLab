// 레벨 테스트용 시드 데이터. 레벨당 3개, 총 30개.
// 서버 최초 실행 시 testSentences 컬렉션이 비어있으면 자동 삽입된다.
export const TEST_SENTENCES = [

  // lv.1 — 초등 1~2학년 (초등 교과서 기반)
  { level: 1, text: 'I have a cat. It is cute.', translation: '나는 고양이가 있다. 그것은 귀엽다.' },
  { level: 1, text: 'This is my bag. It is red.', translation: '이것은 내 가방이다. 그것은 빨간색이다.' },
  { level: 1, text: 'I like apples. They are sweet.', translation: '나는 사과를 좋아한다. 그것들은 달다.' },

  // lv.2 — 초등 3~4학년 (초등 교과서 기반)
  { level: 2, text: 'I usually wake up at seven and eat breakfast with my family.', translation: '나는 보통 7시에 일어나서 가족과 함께 아침을 먹는다.' },
  { level: 2, text: 'My favorite subject is science because I like doing experiments.', translation: '내가 가장 좋아하는 과목은 과학인데, 실험하는 것을 좋아하기 때문이다.' },
  { level: 2, text: 'Last weekend, we went to the park and had a picnic with our neighbors.', translation: '지난 주말에 우리는 공원에 가서 이웃들과 소풍을 즐겼다.' },

  // lv.3 — 초등 5~6학년 (초등 교과서 기반)
  { level: 3, text: 'If you want to stay healthy, you should exercise regularly and eat balanced meals.', translation: '건강을 유지하고 싶다면 규칙적으로 운동하고 균형 잡힌 식사를 해야 한다.' },
  { level: 3, text: 'My brother, who is three years older than me, is studying at a university in Seoul.', translation: '나보다 세 살 많은 내 형은 서울의 한 대학교에서 공부하고 있다.' },
  { level: 3, text: 'When the bell rang, all the students rushed out of the classroom to enjoy their lunch break.', translation: '종이 울리자 모든 학생들이 점심시간을 즐기기 위해 교실 밖으로 뛰쳐나갔다.' },

  // lv.4 — 중학 1학년 (중학 교과서 기반)
  { level: 4, text: 'Although she had never traveled abroad before, she adapted to the new culture more quickly than anyone had expected.', translation: '그녀는 전에 한 번도 해외여행을 한 적이 없었지만, 누구도 예상하지 못한 것보다 더 빨리 새로운 문화에 적응했다.' },
  { level: 4, text: 'The invention of the smartphone has changed the way people communicate, work, and spend their leisure time.', translation: '스마트폰의 발명은 사람들이 소통하고, 일하고, 여가 시간을 보내는 방식을 바꾸어 놓았다.' },
  { level: 4, text: 'It is important that we protect the environment not only for ourselves but also for future generations who will inherit the earth.', translation: '우리 자신뿐만 아니라 지구를 물려받을 미래 세대를 위해서도 환경을 보호하는 것이 중요하다.' },

  // lv.5 — 중학 2~3학년 (중학 교과서 기반)
  { level: 5, text: 'Despite the rapid development of technology, many people argue that face-to-face communication remains irreplaceable in building meaningful relationships.', translation: '기술의 급격한 발전에도 불구하고, 많은 사람들은 의미 있는 관계를 형성하는 데 있어 대면 소통이 여전히 대체 불가능하다고 주장한다.' },
  { level: 5, text: 'The rise of social media has blurred the boundary between public and private life, raising serious concerns about personal privacy.', translation: '소셜 미디어의 부상은 공적 생활과 사적 생활의 경계를 흐려놓았으며, 개인 프라이버시에 대한 심각한 우려를 불러일으키고 있다.' },
  { level: 5, text: 'Volunteering not only benefits the community but also provides individuals with a sense of purpose and an opportunity to develop new skills.', translation: '자원봉사는 지역 사회에 이로울 뿐만 아니라, 개인에게 목적 의식과 새로운 기술을 개발할 기회를 제공한다.' },

  // lv.6 — 고등 1학년 (고등 교과서 기반)
  { level: 6, text: 'It is not until we lose something that we truly appreciate its value, a truth that applies equally to relationships, health, and opportunities.', translation: '무언가를 잃고 나서야 비로소 그 가치를 진정으로 깨닫게 되는데, 이 진실은 인간관계, 건강, 기회에 똑같이 적용된다.' },
  { level: 6, text: 'The way in which a society treats its most vulnerable members is often considered a reflection of its overall level of civilization and moral development.', translation: '한 사회가 가장 취약한 구성원들을 대하는 방식은 흔히 그 사회의 전반적인 문명 수준과 도덕적 발전의 반영으로 여겨진다.' },
  { level: 6, text: 'While globalization has created unprecedented opportunities for economic growth, it has simultaneously widened the gap between the wealthy and the poor in many regions.', translation: '세계화는 경제 성장을 위한 전례 없는 기회를 창출한 반면, 많은 지역에서 빈부 격차를 동시에 심화시켰다.' },

  // lv.7 — 고등 2학년 (고등 교과서 기반)
  { level: 7, text: 'The paradox of choice suggests that an abundance of options, rather than enhancing our sense of freedom, can ultimately lead to greater anxiety and dissatisfaction.', translation: '선택의 역설은 풍부한 선택지가 자유에 대한 우리의 감각을 높이는 대신, 궁극적으로 더 큰 불안과 불만족으로 이어질 수 있다고 제안한다.' },
  { level: 7, text: 'Cognitive biases, which are systematic patterns of deviation from rationality in judgment, often cause individuals to draw inaccurate conclusions from the information available to them.', translation: '인지 편향은 판단에서 합리성으로부터의 체계적인 이탈 패턴으로, 흔히 개인이 이용 가능한 정보로부터 부정확한 결론을 도출하게 만든다.' },
  { level: 7, text: 'The extent to which early childhood experiences shape an individual\'s personality and cognitive development has been a central question in both psychology and education for decades.', translation: '초기 아동 경험이 개인의 성격과 인지 발달을 형성하는 정도는 수십 년간 심리학과 교육학 모두에서 핵심 질문이었다.' },

  // lv.8 — 고등 3학년 / 수능 (수능 기출 기반)
  { level: 8, text: 'The assumption that scientific progress is inherently linear and cumulative has been challenged by historians of science who argue that paradigm shifts often involve the abandonment of previously accepted truths.', translation: '과학적 진보가 본질적으로 선형적이고 누적적이라는 가정은, 패러다임 전환이 흔히 이전에 받아들여진 진실의 포기를 수반한다고 주장하는 과학사학자들에 의해 도전받아 왔다.' },
  { level: 8, text: 'While empathy is widely regarded as a virtue that promotes prosocial behavior, recent research suggests that it can also lead to biased decision-making by causing individuals to prioritize the needs of those they identify with over those of strangers.', translation: '공감은 친사회적 행동을 촉진하는 미덕으로 널리 여겨지지만, 최근 연구는 공감이 편향된 의사결정으로 이어질 수도 있음을 시사한다.' },
  { level: 8, text: 'The notion that language merely reflects reality, rather than actively shaping it, has been fundamentally undermined by research in cognitive linguistics demonstrating that the structure of a language influences how its speakers perceive and categorize experience.', translation: '언어가 현실을 단순히 반영한다는 개념은, 언어의 구조가 화자가 경험을 인식하고 범주화하는 방식에 영향을 미친다는 것을 보여주는 인지언어학 연구에 의해 근본적으로 훼손되었다.' },

  // lv.9 — 수능 고난도 (수능 기출 기반)
  { level: 9, text: 'The epistemological tension between universalist claims in moral philosophy and the particularist commitments of cultural relativism cannot be resolved through empirical inquiry alone, as it ultimately concerns the normative foundations upon which cross-cultural ethical evaluation is predicated.', translation: '도덕 철학의 보편주의적 주장과 문화적 상대주의의 특수주의적 헌신 사이의 인식론적 긴장은 경험적 탐구만으로는 해소될 수 없는데, 이는 궁극적으로 문화 간 윤리적 평가가 전제되는 규범적 토대에 관한 것이기 때문이다.' },
  { level: 9, text: 'The recursive entanglement of observer and observed within ethnographic methodology necessitates a reflexive epistemological stance that acknowledges the co-constitutive role of the researcher in the production of knowledge.', translation: '민족지학적 방법론 내에서 관찰자와 관찰 대상의 재귀적 얽힘은 지식 생산에 있어 연구자의 공동구성적 역할을 인정하는 반성적 인식론적 입장을 필요로 한다.' },
  { level: 9, text: 'Poststructuralist critiques of the Enlightenment subject have demonstrated that the autonomous, self-constituting individual presupposed by liberal political theory is itself a historically contingent discursive construction whose universalist pretensions serve to naturalize particular configurations of power.', translation: '계몽주의적 주체에 대한 후기구조주의적 비판은 자유주의 정치이론이 전제하는 자율적 개인이 그 자체로 역사적으로 우연한 담론적 구성물이며, 그것의 보편주의적 주장이 특정한 권력 배치를 자연화하는 데 기여함을 보여주었다.' },

  // lv.10 — 학술 논문 (실제 학술 논문 기반)
  { level: 10, text: 'The proliferation of algorithmic decision-making systems across institutional domains has engendered significant normative concerns regarding accountability, transparency, and the entrenchment of systemic bias within ostensibly neutral computational frameworks.', translation: '제도적 영역 전반에 걸친 알고리즘 의사결정 시스템의 확산은 책임성, 투명성, 그리고 표면상 중립적인 계산 프레임워크 내에 체계적 편향이 고착화되는 것에 관한 상당한 규범적 우려를 불러일으켰다.' },
  { level: 10, text: 'Contrary to the reductionist paradigm that has long dominated biomedical research, emerging evidence suggests that complex psychiatric disorders arise from dynamic interactions among genetic predispositions, epigenetic modifications, and socioenvironmental stressors across developmental trajectories.', translation: '오랫동안 생의학 연구를 지배해 온 환원주의적 패러다임과 달리, 새로운 증거들은 복잡한 정신 장애가 발달 궤적 전반에 걸쳐 유전적 소인, 후성 유전학적 변형, 사회환경적 스트레스 요인 간의 역동적 상호작용으로부터 발생한다는 것을 시사한다.' },
  { level: 10, text: 'The ontological indeterminacy inherent in quantum mechanical systems fundamentally precludes the assignment of definite values to conjugate observables prior to measurement, thereby challenging classical conceptions of physical reality as mind-independent and causally determinate.', translation: '양자역학적 시스템에 내재된 존재론적 불확정성은 측정 이전에 켤레 관측량에 확정적 값을 할당하는 것을 근본적으로 불가능하게 하며, 이로써 물리적 실재를 정신 독립적이고 인과적으로 결정된 것으로 보는 고전적 개념에 도전한다.' },

];
