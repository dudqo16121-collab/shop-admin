"use client";

import { C, styles } from "../theme";
import { StatusBadge } from "../ui/common";

// ── 화면 7: 리뷰·평점 관리 ──────────────────────────────────
export default function Reviews() {
  const bars = [[5, 65, "green"], [4, 20, "#7ec48a"], [3, 8, "amber"], [2, 4, "#e09060"], [1, 3, "red"]];
  const keywords = [["품질 좋음", 284], ["배송 빠름", 198], ["재구매 의사", 156], ["포장 꼼꼼", 92], ["사이즈 정확", 78], ["가성비", 64]];
  const reviews = [
    { name: "홍*동", stars: 5, prod: "프리미엄 후디 · 블랙/M", date: "06/10", text: "품질이 정말 좋아요. 소재가 생각보다 훨씬 고급스럽고 착용감도 훌륭합니다. 배송도 빠르게 왔고 재구매 의사 있습니다.", replied: true, status: "공개", flagged: false },
    { name: "이*준", stars: 2, prod: "클래식 티셔츠 · 화이트", date: "06/09", text: "기대했던 것과 달라서 실망했습니다. 사이즈가 맞지 않고 색상도 사진과 달랐어요.", replied: false, status: "검토 필요", flagged: true },
  ];
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()}>↓ 리뷰 내보내기</button>
        <button style={styles.btn()}>⚙ 노출 설정</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr) minmax(0,1.5fr)", gap: 12 }}>
        <div style={{ ...styles.card, textAlign: "center", paddingTop: 16 }}>
          <div style={styles.cardTitle}>전체 평점</div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1px" }}>4.3</div>
          <div style={{ fontSize: 16, color: C.amber, marginBottom: 4 }}>★★★★☆</div>
          <div style={{ fontSize: 11, color: C.textHint }}>리뷰 1,284개</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>별점 분포</div>
          {bars.map(([star, pct, col]) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.textSub, width: 20, textAlign: "right" }}>{star}★</span>
              <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: col === "green" ? C.green : col === "amber" ? C.amber : col === "red" ? C.red : col, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 10, color: C.textHint, width: 26 }}>{pct}%</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>자주 언급된 키워드</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {keywords.map(([kw, cnt]) => (
              <span key={kw} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
                {kw} <span style={{ color: C.textHint }}>{cnt}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>🔍 내용·상품명·고객명 검색...</div>
        <select style={styles.select}><option>별점 전체</option><option>5★</option><option>4★</option><option>3★ 이하</option></select>
        <select style={styles.select}><option>노출 상태</option><option>공개</option><option>숨김</option><option>검토 필요</option></select>
        <select style={styles.select}><option>최신순</option><option>낮은 별점순</option><option>도움됨순</option></select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map((r, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: r.flagged ? `3px solid ${C.red}` : `3px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 7 }}>
              <div style={{ ...styles.avatar, width: 30, height: 30, fontSize: 13, flexShrink: 0 }}>{r.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{r.name}</span>
                  {r.flagged && <span style={styles.badge("red")}>🚩 신고됨</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: C.textHint, marginTop: 2 }}>
                  <span style={{ color: C.amber }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                  <span>{r.date}</span>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div style={{ fontSize: 10, color: C.textHint, marginBottom: 5 }}>📦 {r.prod}</div>
            <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.6, marginBottom: 8 }}>{r.text}</div>
            {r.replied ? (
              <div style={{ background: C.bg, borderRadius: 7, padding: "8px 10px", marginBottom: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textSub, marginBottom: 3 }}>🏪 판매자 답변</div>
                <div style={{ fontSize: 11, color: C.textSub }}>소중한 리뷰 감사합니다. 앞으로도 좋은 상품으로 찾아뵙겠습니다.</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input style={{ ...styles.input, height: 30 }} placeholder="판매자 답변을 입력하세요..." />
                <button style={{ ...styles.btn("primary"), whiteSpace: "nowrap" }}>답변 등록</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {r.replied && <button style={styles.smBtn}>답변 수정</button>}
              <button style={{ ...styles.smBtn, color: C.red }}>👁‍🗨 숨김</button>
              {r.flagged && <><button style={styles.smBtn}>✓ 검토 완료</button><button style={{ ...styles.smBtn, color: C.red }}>신고 처리</button></>}
              <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint }}>👍 도움됨 {r.flagged ? 2 : 48}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
