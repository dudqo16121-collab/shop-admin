"use client";

import { useState } from "react";
import { C, styles } from "../theme";

// ── 스토어 설정 페이지 ───────────────────────────────────────
export default function StoreSettings() {
  const [tab, setTab] = useState("기본 정보");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 이 화면 전용 폼 컴포넌트 (공용 Modal 컴포넌트와는 별개)
  const Toggle = ({ on }) => (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.green : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );

  const Field = ({ label, required, children, hint }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.textHint }}>{hint}</div>}
    </div>
  );

  const Input = ({ defaultValue, placeholder, type = "text" }) => (
    <input type={type} defaultValue={defaultValue} placeholder={placeholder}
      style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box" }}
    />
  );

  const Textarea = ({ defaultValue, placeholder, rows = 3 }) => (
    <textarea defaultValue={defaultValue} placeholder={placeholder} rows={rows}
      style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box", resize: "vertical" }}
    />
  );

  const Select = ({ defaultValue, children }) => (
    <select defaultValue={defaultValue}
      style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box" }}
    >{children}</select>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 0 2px", borderBottom: `1px solid ${C.border}`, marginBottom: 2 }}>{children}</div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  return (
    <>
      {/* 저장 완료 토스트 */}
      {saved && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          ✓ 설정이 저장되었습니다
        </div>
      )}

      {/* 탭 + 저장 버튼 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flex: 1 }}>
          {["기본 정보", "배송 정책", "결제 설정", "알림 설정", "약관 관리"].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1, whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>
        <button onClick={handleSave} style={{ ...styles.btn("primary"), marginLeft: 12, whiteSpace: "nowrap" }}>저장</button>
      </div>

      {/* 기본 정보 탭 */}
      {tab === "기본 정보" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>스토어 정보</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <Field label="스토어명" required><Input defaultValue="ShopAdmin" /></Field>
                <Field label="스토어 URL" required hint="https://yourstore.com">
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.textHint, display: "flex", alignItems: "center", background: C.bg, whiteSpace: "nowrap" }}>https://</div>
                    <Input defaultValue="shopadmin.com" />
                  </div>
                </Field>
                <Field label="스토어 소개">
                  <Textarea defaultValue="프리미엄 패션 쇼핑몰 ShopAdmin입니다." rows={3} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="사업자 번호" required><Input defaultValue="000-00-00000" /></Field>
                  <Field label="통신판매업 신고번호"><Input defaultValue="제2024-서울강남-0000호" /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="대표자명" required><Input defaultValue="홍길동" /></Field>
                  <Field label="대표 전화" required><Input defaultValue="02-0000-0000" /></Field>
                </div>
                <Field label="사업장 주소"><Input defaultValue="서울시 강남구 테헤란로 00" /></Field>
                <Field label="고객센터 이메일"><Input defaultValue="cs@shopadmin.com" type="email" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>운영 시간</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <Field label="운영 시작"><Input defaultValue="09:00" type="time" /></Field>
                  <Field label="운영 종료"><Input defaultValue="18:00" type="time" /></Field>
                  <Field label="점심 시간"><Input defaultValue="12:00 ~ 13:00" /></Field>
                </div>
                <SettingRow label="주말 운영" desc="토·일요일 고객센터 운영"><Toggle on={false} /></SettingRow>
                <SettingRow label="공휴일 운영" desc="공휴일 고객센터 운영"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>스토어 로고 · 이미지</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {[["로고 이미지", "권장 200×60px · PNG/SVG"], ["파비콘", "32×32px · ICO/PNG"], ["대표 이미지", "권장 1200×630px · OG 이미지"]].map(([label, hint]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 5 }}>{label}</div>
                    <div style={{ border: `1px dashed ${C.borderMid}`, borderRadius: 8, height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", background: C.bg }}>
                      <div style={{ fontSize: 18 }}>☁</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>SNS 채널</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {[["인스타그램", "@shopadmin"], ["카카오톡 채널", "@shopadmin"], ["유튜브", "ShopAdmin TV"], ["블로그", "blog.naver.com/shopadmin"]].map(([label, placeholder]) => (
                  <Field key={label} label={label}><Input placeholder={placeholder} /></Field>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>SEO 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="메타 제목"><Input defaultValue="ShopAdmin — 프리미엄 패션 쇼핑몰" /></Field>
                <Field label="메타 설명"><Textarea defaultValue="ShopAdmin에서 프리미엄 패션 아이템을 만나보세요." rows={2} /></Field>
                <Field label="검색 키워드"><Input defaultValue="패션, 의류, 쇼핑몰" /></Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배송 정책 탭 */}
      {tab === "배송 정책" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>기본 배송 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="기본 배송사"><Select defaultValue="CJ대한통운"><option>CJ대한통운</option><option>한진택배</option><option>로젠택배</option><option>우체국</option></Select></Field>
                  <Field label="기본 배송비"><Input defaultValue="3000" /></Field>
                </div>
                <Field label="무료 배송 기준 금액" hint="해당 금액 이상 주문 시 무료 배송">
                  <Input defaultValue="50000" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="출고 소요일" hint="결제 후 출고까지"><Input defaultValue="1~2" /></Field>
                  <Field label="배송 소요일" hint="출고 후 수령까지"><Input defaultValue="1~3" /></Field>
                </div>
                <SettingRow label="당일 배송" desc="오전 11시 이전 주문 당일 출고"><Toggle on={false} /></SettingRow>
                <SettingRow label="새벽 배송" desc="새벽 7시 이전 배송 (수도권)"><Toggle on={false} /></SettingRow>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>도서 산간 배송</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <SettingRow label="도서 산간 지역 배송" desc="제주 및 도서 산간 지역 배송 허용"><Toggle on={true} /></SettingRow>
                <Field label="도서 산간 추가 배송비"><Input defaultValue="3000" /></Field>
                <Field label="제주 추가 배송비"><Input defaultValue="5000" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>교환 · 반품 정책</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="교환 가능 기간" hint="수령 후 며칠 이내"><Input defaultValue="7" /></Field>
                  <Field label="반품 가능 기간" hint="수령 후 며칠 이내"><Input defaultValue="7" /></Field>
                </div>
                <Field label="왕복 배송비 (고객 단순 변심)"><Input defaultValue="6000" /></Field>
                <SettingRow label="하자 상품 무료 반품" desc="상품 불량 시 무료 교환/반품"><Toggle on={true} /></SettingRow>
                <Field label="반품 안내 메시지">
                  <Textarea defaultValue="고객 변심에 의한 반품의 경우 왕복 배송비 6,000원이 발생합니다." rows={2} />
                </Field>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>배송사별 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 10 }}>
                {[
                  { name: "CJ대한통운", code: "04", active: true },
                  { name: "한진택배", code: "05", active: true },
                  { name: "로젠택배", code: "06", active: true },
                  { name: "우체국", code: "01", active: false },
                  { name: "롯데택배", code: "08", active: false },
                ].map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>업체 코드: {c.code}</div>
                    </div>
                    <Toggle on={c.active} />
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>배송 알림 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                <SettingRow label="출고 완료 알림" desc="고객에게 출고 알림 문자 발송"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 시작 알림" desc="배송 시작 시 카카오 알림톡"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 완료 알림" desc="배송 완료 후 리뷰 요청"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 지연 알림" desc="예상일 초과 시 자동 안내"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결제 설정 탭 */}
      {tab === "결제 설정" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>결제 수단 활성화</SectionTitle>
              <div style={{ marginTop: 10 }}>
                {[
                  { label: "신용카드", desc: "국내외 신용·체크카드", on: true },
                  { label: "카카오페이", desc: "카카오페이 간편결제", on: true },
                  { label: "네이버페이", desc: "네이버페이 결제", on: true },
                  { label: "토스페이", desc: "토스페이 간편결제", on: true },
                  { label: "무통장입금", desc: "계좌이체 (수동 확인)", on: true },
                  { label: "포인트 결제", desc: "적립 포인트 사용", on: true },
                  { label: "상품권", desc: "자사 상품권 코드 입력", on: false },
                  { label: "애플페이", desc: "Apple Pay (Safari)", on: false },
                ].map(item => (
                  <SettingRow key={item.label} label={item.label} desc={item.desc}><Toggle on={item.on} /></SettingRow>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>무통장입금 계좌 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="은행"><Select defaultValue="국민은행"><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>기업은행</option></Select></Field>
                  <Field label="예금주"><Input defaultValue="ShopAdmin(주)" /></Field>
                </div>
                <Field label="계좌번호"><Input defaultValue="000-00-000000" /></Field>
                <Field label="입금 확인 마감 시간" hint="마감 후 자동 취소">
                  <Select defaultValue="24시간"><option>12시간</option><option>24시간</option><option>48시간</option><option>72시간</option></Select>
                </Field>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>할부 · 포인트 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="할부 최대 개월수"><Select defaultValue="12개월"><option>3개월</option><option>6개월</option><option>12개월</option><option>24개월</option></Select></Field>
                <Field label="무이자 할부 개월" hint="카드사 무이자 할부 기간"><Input defaultValue="3, 6" /></Field>
                <div style={{ height: 1, background: C.border }} />
                <Field label="포인트 적립률" hint="결제 금액의 %"><Input defaultValue="1" /></Field>
                <Field label="포인트 최소 사용액"><Input defaultValue="1000" /></Field>
                <Field label="포인트 최대 사용 비율" hint="주문 금액의 최대 %"><Input defaultValue="50" /></Field>
                <SettingRow label="회원가입 포인트 지급" desc="신규 가입 시 포인트 지급"><Toggle on={true} /></SettingRow>
                <Field label="회원가입 지급 포인트"><Input defaultValue="1000" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>결제 보안 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                <SettingRow label="SSL 보안 결제" desc="HTTPS 암호화 결제 강제"><Toggle on={true} /></SettingRow>
                <SettingRow label="결제 이상 감지" desc="비정상 결제 패턴 차단"><Toggle on={true} /></SettingRow>
                <SettingRow label="해외 결제 허용" desc="해외 카드 결제 허용"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 설정 탭 */}
      {tab === "알림 설정" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={styles.card}>
            <SectionTitle>고객 알림 설정</SectionTitle>
            <div style={{ marginTop: 10 }}>
              {[
                { label: "주문 접수 확인", desc: "주문 완료 시 고객 알림" },
                { label: "결제 완료 알림", desc: "결제 성공 시 영수증 발송" },
                { label: "배송 시작 알림", desc: "출고 시 송장번호 포함 발송" },
                { label: "배송 완료 알림", desc: "배송 완료 후 리뷰 요청" },
                { label: "교환/반품 처리", desc: "처리 단계별 고객 안내" },
                { label: "이벤트·프로모션", desc: "신규 프로모션 알림" },
                { label: "포인트 적립", desc: "포인트 변동 시 알림" },
              ].map((item, i) => (
                <SettingRow key={item.label} label={item.label} desc={item.desc}><Toggle on={i < 5} /></SettingRow>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>관리자 알림 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                {[
                  { label: "신규 주문 알림", on: true },
                  { label: "재고 부족 알림", on: true },
                  { label: "취소/반품 알림", on: true },
                  { label: "신규 리뷰 알림", on: false },
                  { label: "CS 문의 알림", on: true },
                  { label: "정산 완료 알림", on: true },
                ].map(item => (
                  <SettingRow key={item.label} label={item.label} desc=""><Toggle on={item.on} /></SettingRow>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>알림 채널</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="알림 이메일"><Input defaultValue="admin@shopadmin.com" type="email" /></Field>
                <Field label="카카오 알림톡 발신 프로필"><Input defaultValue="@shopadmin" /></Field>
                <Field label="SMS 발신 번호"><Input defaultValue="02-0000-0000" /></Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 약관 관리 탭 */}
      {tab === "약관 관리" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { title: "이용약관", updated: "2026-01-01", required: true, content: "제1조 (목적)\n본 약관은 ShopAdmin이 제공하는 전자상거래 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n서비스란 회사가 제공하는 쇼핑몰 플랫폼 서비스를 의미합니다." },
            { title: "개인정보처리방침", updated: "2026-01-01", required: true, content: "1. 개인정보의 수집 및 이용 목적\nShopAdmin은 다음과 같은 목적으로 개인정보를 수집·이용합니다.\n- 회원 가입 및 관리\n- 서비스 제공 및 계약 이행\n- 고객 상담 및 불만 처리" },
            { title: "환불 정책", updated: "2026-03-01", required: false, content: "1. 교환 및 반품 기간\n상품 수령 후 7일 이내 교환 및 반품 신청이 가능합니다.\n\n2. 교환 및 반품 불가 사유\n- 상품 사용 또는 훼손된 경우\n- 포장 개봉 후 상품 가치가 현저히 감소한 경우" },
            { title: "마케팅 정보 수신 동의", updated: "2026-01-01", required: false, content: "ShopAdmin은 고객님의 동의를 받아 프로모션, 이벤트, 신상품 안내 등 마케팅 정보를 이메일 및 SMS로 발송합니다." },
          ].map((terms) => (
            <div key={terms.title} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{terms.title}</div>
                {terms.required && <span style={styles.badge("red")}>필수</span>}
                <span style={{ fontSize: 10, color: C.textHint }}>최종 수정: {terms.updated}</span>
                <button style={styles.smBtn}>수정</button>
                <button style={styles.smBtn}>미리보기</button>
              </div>
              <textarea
                defaultValue={terms.content}
                style={{ width: "100%", height: 100, borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 10px", fontSize: 11, color: C.textSub, resize: "vertical", outline: "none", background: C.surface, boxSizing: "border-box", lineHeight: 1.6 }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
