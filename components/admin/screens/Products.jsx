"use client";

import { C, styles } from "../theme";

// ── 화면 4: 상품 등록 ────────────────────────────────────────
export default function Products() {
  const stockRows = [["블랙 / S", "SKU-001", "42"], ["블랙 / M", "SKU-002", "38"], ["화이트 / S", "SKU-003", "15"], ["화이트 / M", "SKU-004", "27"]];
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()}>임시저장</button>
        <button style={{ ...styles.btn("danger") }}>삭제</button>
        <button style={styles.btn("primary")}>✓ 저장 및 게시</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>기본 정보</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>상품명 <span style={{ color: C.red }}>*</span></div><input style={styles.input} placeholder="상품 이름을 입력하세요" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>카테고리 *</div><select style={{ ...styles.input, height: 32 }}><option>카테고리 선택</option><option>의류</option><option>신발</option><option>악세서리</option></select></div>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>서브 카테고리</div><select style={{ ...styles.input, height: 32 }}><option>서브 선택</option></select></div>
              </div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>상품 설명</div><textarea style={{ ...styles.input, height: 72, padding: 8, resize: "none" }} placeholder="상품에 대한 설명을 입력하세요. 고객에게 노출됩니다." /></div>
              <div>
                <div style={{ fontSize: 10, color: C.textSub, marginBottom: 5 }}>태그</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {["프리미엄", "베스트셀러", "신상품"].map(t => <span key={t} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>{t} ✕</span>)}
                  <span style={{ fontSize: 10, color: C.blue, cursor: "pointer" }}>+ 태그 추가</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>상품 이미지</div>
            <div style={{ border: `1px dashed ${C.borderMid}`, borderRadius: 8, height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", background: C.bg }}>
              <div style={{ fontSize: 22 }}>☁</div>
              <div style={{ fontSize: 11, color: C.textSub }}>클릭하거나 파일을 드래그하세요</div>
              <div style={{ fontSize: 10, color: C.textHint }}>PNG, JPG 최대 10MB · 권장 800×800px</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[1, 2].map(i => <div key={i} style={{ width: 44, height: 44, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🖼</div>)}
              <div style={{ width: 44, height: 44, borderRadius: 7, border: `1px dashed ${C.borderMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", color: C.textHint }}>+</div>
            </div>
            <div style={{ fontSize: 10, color: C.textHint, marginTop: 5 }}>첫 번째 이미지가 대표 이미지로 사용됩니다.</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>옵션 및 재고</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 5 }}>옵션 유형</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {["색상", "사이즈"].map(o => <span key={o} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.blueBg, color: C.blueText, border: "none" }}>{o} ✕</span>)}
                <span style={{ fontSize: 10, color: C.blue, cursor: "pointer" }}>+ 옵션 추가</span>
              </div>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: C.bg }}>
                {["옵션 조합", "SKU", "재고 수량"].map(h => <div key={h} style={{ ...styles.th, padding: "7px 10px" }}>{h}</div>)}
              </div>
              {stockRows.map(([opt, sku, qty]) => (
                <div key={opt} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ ...styles.td, borderBottom: "none" }}>{opt}</div>
                  <div style={{ ...styles.td, borderBottom: "none" }}><input style={{ ...styles.input, height: 24, fontSize: 11 }} defaultValue={sku} /></div>
                  <div style={{ ...styles.td, borderBottom: "none" }}><input style={{ ...styles.input, height: 24, fontSize: 11 }} defaultValue={qty} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>가격 설정</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>정가 *</div><input style={styles.input} placeholder="₩ 0" /></div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>할인 판매가</div><input style={styles.input} placeholder="₩ 0" /><div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>설정 시 정가에 취소선 표시</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>부가세</div><select style={{ ...styles.input, height: 32 }}><option>과세</option><option>면세</option></select></div>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>배송비</div><input style={styles.input} placeholder="₩ 0" /></div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>판매 설정</div>
            {[["판매 활성화", true], ["메인 노출", true], ["리뷰 허용", true], ["재고 소진 시 주문 허용", false]].map(([label, on]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.textSub }}>{label}</span>
                <div style={{ width: 30, height: 16, borderRadius: 8, background: on ? C.green : C.border, position: "relative", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>SEO 설정</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>검색 제목</div><input style={styles.input} placeholder="검색 엔진 표시 제목" /></div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>메타 설명</div><textarea style={{ ...styles.input, height: 52, padding: 8, resize: "none" }} placeholder="검색 결과 미리보기 설명 (160자 이내)" /></div>
              <div style={{ background: C.bg, borderRadius: 7, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: C.blue }}>상품명 — ShopAdmin</div>
                <div style={{ fontSize: 10, color: C.green }}>https://yourstore.com/products/상품-슬러그</div>
                <div style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>메타 설명이 여기에 표시됩니다. 검색 결과에서 노출되는 미리보기입니다.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
