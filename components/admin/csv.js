// ── CSV 내보내기 유틸 ────────────────────────────────────────
export function downloadCSV(filename, headers, rows) {
  const BOM = "\uFEFF";
  const headerRow = headers.join(",");
  const dataRows = rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? "");
      return str.includes(",") || str.includes("\n") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = BOM + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOrders(orders) {
  downloadCSV("주문목록",
    ["주문번호", "주문일시", "고객명", "주문상품", "수량", "결제금액", "결제수단", "상태"],
    orders.map(o => [o.id, o.date, o.cust, o.prod, o.qty, o.amt, o.pay, o.status])
  );
}

export function exportProducts(products) {
  downloadCSV("상품목록",
    ["상품ID", "상품명", "카테고리", "SKU수", "판매가", "재고", "판매량", "평점", "상태", "등록일"],
    products.map(p => [p.id, p.name, p.cat, p.skus, p.price, p.stock, p.sales, p.rating, p.status, p.created])
  );
}

export function exportCustomers(customers) {
  downloadCSV("고객목록",
    ["고객ID", "이름", "이메일", "전화번호", "등급", "주문횟수", "총구매액", "포인트", "가입일", "최근주문", "상태"],
    customers.map(c => [c.id, c.name, c.email, c.phone, c.gradeDetail, c.orders, c.total, c.point, c.joined, c.lastOrder, c.status])
  );
}

export function exportInventory(products) {
  downloadCSV("재고현황",
    ["SKU", "상품명", "카테고리", "옵션", "현재고", "최소재고", "입고수량", "출고수량", "재고가치"],
    products.map(p => [p.id, p.name, p.cat, p.opt, p.stock, p.min, p.in, p.out, p.stock * p.price])
  );
}

export function exportSettlement(data) {
  downloadCSV("정산내역",
    ["정산월", "매출", "수수료", "부가세", "배송비차감", "정산액", "정산일", "상태"],
    data.map(d => [d.month, d.sales, d.fee, d.vat, d.shipping, d.net, d.date, d.status])
  );
}
