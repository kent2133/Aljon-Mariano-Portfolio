"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Container,
  FilePlus2,
  Filter,
  PackageCheck,
  PackageOpen,
  Search,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  Truck,
  Warehouse,
} from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, ProgressBar, Sparkline, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type StockView = "overview" | "inventory" | "orders" | "receiving";
type PurchaseOrderStatus = "Draft" | "Awaiting approval" | "Approved" | "In transit" | "Part received" | "Received";

type StockItem = {
  sku: string;
  name: string;
  category: string;
  warehouse: "MNL-A" | "MNL-B" | "CEB-01";
  bin: string;
  onHand: number;
  available: number;
  reorder: number;
  unitCost: number;
  movement: number[];
  supplier: string;
};

type PurchaseOrder = {
  id: string;
  supplier: string;
  issued: string;
  due: string;
  amount: number;
  lines: number;
  status: PurchaseOrderStatus;
  owner: string;
};

const inventory: StockItem[] = [
  { sku: "ELEC-1048", name: "USB-C Dock 11-in-1", category: "Electronics", warehouse: "MNL-A", bin: "A-04-12", onHand: 14, available: 9, reorder: 24, unitCost: 3680, movement: [38, 35, 31, 29, 22, 19, 14], supplier: "Tekline Distribution" },
  { sku: "OFFC-2021", name: "Thermal Label Roll 4×6", category: "Office supplies", warehouse: "MNL-B", bin: "B-11-03", onHand: 62, available: 52, reorder: 80, unitCost: 285, movement: [112, 104, 96, 87, 80, 71, 62], supplier: "PrintWorks PH" },
  { sku: "SAFE-0714", name: "Nitrile Gloves · Large", category: "Safety", warehouse: "CEB-01", bin: "C-02-09", onHand: 188, available: 172, reorder: 120, unitCost: 420, movement: [142, 151, 166, 174, 192, 183, 188], supplier: "MedSupply Cebu" },
  { sku: "ELEC-0992", name: "65W GaN Power Adapter", category: "Electronics", warehouse: "MNL-A", bin: "A-04-08", onHand: 31, available: 28, reorder: 25, unitCost: 1480, movement: [44, 42, 39, 35, 33, 32, 31], supplier: "Tekline Distribution" },
  { sku: "PACK-3304", name: "Mailing Box · Medium", category: "Packaging", warehouse: "MNL-B", bin: "B-18-02", onHand: 420, available: 398, reorder: 250, unitCost: 42, movement: [318, 346, 401, 385, 410, 438, 420], supplier: "Karton Works" },
  { sku: "TOOL-1887", name: "Precision Driver Set", category: "Tools", warehouse: "CEB-01", bin: "C-06-04", onHand: 8, available: 6, reorder: 18, unitCost: 925, movement: [21, 19, 17, 15, 12, 10, 8], supplier: "BuildPro Trading" },
  { sku: "NETW-0441", name: "Cat6A Patch Cable · 2m", category: "Networking", warehouse: "MNL-A", bin: "A-09-16", onHand: 93, available: 87, reorder: 50, unitCost: 195, movement: [72, 81, 79, 88, 102, 97, 93], supplier: "Nexus Cabling" },
  { sku: "OFFC-2116", name: "A4 Copy Paper · 80gsm", category: "Office supplies", warehouse: "MNL-B", bin: "B-12-01", onHand: 27, available: 20, reorder: 35, unitCost: 248, movement: [58, 51, 47, 41, 36, 32, 27], supplier: "Paperline Corp." },
];

const initialPurchaseOrders: PurchaseOrder[] = [
  { id: "PO-2026-1042", supplier: "Tekline Distribution", issued: "27 Oct", due: "30 Oct", amount: 286400, lines: 6, status: "Awaiting approval", owner: "Aya Lim" },
  { id: "PO-2026-1039", supplier: "PrintWorks PH", issued: "26 Oct", due: "29 Oct", amount: 98750, lines: 4, status: "In transit", owner: "Aya Lim" },
  { id: "PO-2026-1036", supplier: "BuildPro Trading", issued: "24 Oct", due: "28 Oct", amount: 148000, lines: 8, status: "Part received", owner: "Miguel Tan" },
  { id: "PO-2026-1031", supplier: "Karton Works", issued: "22 Oct", due: "27 Oct", amount: 75600, lines: 3, status: "Received", owner: "Aya Lim" },
  { id: "PO-2026-1028", supplier: "MedSupply Cebu", issued: "20 Oct", due: "25 Oct", amount: 126900, lines: 5, status: "Received", owner: "Miguel Tan" },
];

const receipts = [
  { id: "ASN-8841", supplier: "PrintWorks PH", po: "PO-2026-1039", eta: "09:30", dock: "Dock 02", cartons: 42, lines: 4, received: 0, status: "Arriving" },
  { id: "ASN-8838", supplier: "BuildPro Trading", po: "PO-2026-1036", eta: "11:15", dock: "Dock 01", cartons: 18, lines: 8, received: 5, status: "Counting" },
  { id: "ASN-8844", supplier: "Nexus Cabling", po: "PO-2026-1045", eta: "14:40", dock: "Unassigned", cartons: 26, lines: 3, received: 0, status: "Scheduled" },
];

const suppliers = [
  { name: "Tekline Distribution", initials: "TD", onTime: 96, spend: "₱2.84M", open: 2 },
  { name: "PrintWorks PH", initials: "PW", onTime: 91, spend: "₱1.42M", open: 1 },
  { name: "Karton Works", initials: "KW", onTime: 98, spend: "₱986K", open: 0 },
];

const views: { id: StockView; label: string; count?: string }[] = [
  { id: "overview", label: "Control tower" },
  { id: "inventory", label: "Inventory", count: "1,842" },
  { id: "orders", label: "Purchase orders", count: "12" },
  { id: "receiving", label: "Receiving", count: "3" },
];

function peso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function poTone(status: string) {
  if (status === "Received" || status === "Approved") return "good" as const;
  if (status === "Awaiting approval") return "warn" as const;
  if (status === "Part received") return "info" as const;
  return "neutral" as const;
}

function StockFlowWorkspace() {
  const { session, events } = useOperations();
  const [view, setView] = useState<StockView>("overview");
  const [query, setQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<"All" | StockItem["warehouse"]>("All");
  const [selectedSku, setSelectedSku] = useState("ELEC-1048");
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [selectedPo, setSelectedPo] = useState(initialPurchaseOrders[0].id);
  const [selectedReceipt, setSelectedReceipt] = useState(receipts[1].id);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [receivedLines, setReceivedLines] = useState<Record<string, number>>({});
  const [inventoryActivity, setInventoryActivity] = useState<Record<string, string>>({});
  const [orderActivity, setOrderActivity] = useState<Record<string, string>>({});
  const [receiptActivity, setReceiptActivity] = useState<Record<string, string>>({});

  const role = session?.role || "clerk";
  const visibleInventory = useMemo(() => inventory
    .map((item) => ({ ...item, onHand: item.onHand + (adjustments[item.sku] || 0), available: item.available + (adjustments[item.sku] || 0) }))
    .filter((item) => warehouseFilter === "All" || item.warehouse === warehouseFilter)
    .filter((item) => `${item.sku} ${item.name} ${item.category} ${item.supplier}`.toLowerCase().includes(query.toLowerCase())), [adjustments, query, warehouseFilter]);
  const focusedItem = visibleInventory.find((item) => item.sku === selectedSku) || inventory.find((item) => item.sku === selectedSku) || inventory[0];
  const focusedPo = purchaseOrders.find((order) => order.id === selectedPo) || purchaseOrders[0];
  const focusedReceipt = receipts.find((receipt) => receipt.id === selectedReceipt) || receipts[0];
  const focusedReceived = receivedLines[focusedReceipt.id] ?? focusedReceipt.received;
  const createdOrderCount = purchaseOrders.filter((order) => order.id.startsWith("PO-DEMO-")).length;
  const nextPoId = `PO-DEMO-${String(createdOrderCount + 1).padStart(3, "0")}`;
  const poSubmitted = focusedPo.status !== "Draft";
  const poApproved = !["Draft", "Awaiting approval"].includes(focusedPo.status);

  const headerAction = role === "clerk" ? "stock:count" : "purchase:create";
  const headerLabel = role === "clerk" ? "Start cycle count" : "New purchase order";
  const headerRecord = role === "clerk" ? `COUNT-${selectedSku}` : nextPoId;

  return (
    <>
      <header className="system-header">
        <div>
          <p className="system-eyebrow">Network inventory · Three active warehouses</p>
          <h1>Every unit accounted for. <em>Every reorder on time.</em></h1>
          <p className="system-header-copy">Connect purchasing, receiving, stock control, and valuation in one operational ledger built for confident decisions.</p>
        </div>
        <div className="system-actions">
          <button onClick={() => setView("receiving")}><Truck size={14} /> Today&apos;s arrivals</button>
          <WorkflowButton action={headerAction} recordId={headerRecord} note={`${headerLabel} from StockFlow control tower`} className="primary" onSuccess={() => {
            if (role === "clerk") {
              const cycleSku = inventory.find((item) => item.warehouse === "MNL-A")?.sku || inventory[0].sku;
              setSelectedSku(cycleSku);
              setWarehouseFilter("MNL-A");
              setQuery("");
              setInventoryActivity((current) => ({ ...current, [cycleSku]: "Cycle count started - ready to record" }));
              setView("inventory");
              return;
            }
            const newOrder: PurchaseOrder = {
              id: nextPoId,
              supplier: "Unassigned supplier",
              issued: "Today",
              due: "Not set",
              amount: 0,
              lines: 0,
              status: "Draft",
              owner: session?.name || "Current purchaser",
            };
            setPurchaseOrders((current) => [newOrder, ...current]);
            setOrderActivity((current) => ({ ...current, [nextPoId]: "Draft created just now - ready for line items" }));
            setSelectedPo(nextPoId);
            setView("orders");
          }}>
            {role === "clerk" ? <ClipboardCheck size={14} /> : <FilePlus2 size={14} />} {headerLabel}
          </WorkflowButton>
        </div>
      </header>

      <nav className={styles.viewNav} aria-label="StockFlow sections">
        {views.map((item) => <button key={item.id} className={view === item.id ? styles.active : ""} onClick={() => setView(item.id)}><span>{item.label}</span>{item.count && <b>{item.id === "orders" ? String(12 + createdOrderCount) : item.count}</b>}</button>)}
      </nav>

      {view === "overview" && (
        <div className={styles.viewStack}>
          <section className="metric-grid" aria-label="Inventory performance metrics">
            <MetricCard label="Inventory value" value="₱8.42M" delta="+2.4%" detail="At weighted average cost" tone="good" />
            <MetricCard label="Low-stock SKUs" value="18" delta="6 critical" detail="Across three warehouses" tone="warn" />
            <MetricCard label="Open PO value" value="₱1.16M" delta="12 orders" detail="₱286K awaiting approval" />
            <MetricCard label="Stock accuracy" value="98.6%" delta="+0.7%" detail="Last 30-day cycle counts" tone="good" />
          </section>

          <div className={styles.controlGrid}>
            <Panel eyebrow="Network position" title="Inventory health by class">
              <div className={styles.healthPanel}>
                <div className={styles.stockRing} role="img" aria-label="74 percent healthy, 17 percent watch, 9 percent critical"><div><strong>91%</strong><span>serviceable</span></div></div>
                <div className={styles.healthLegend}>
                  <div><i className={styles.healthy}></i><span>Healthy stock</span><strong>1,365 SKUs</strong><b>74%</b></div>
                  <div><i className={styles.watch}></i><span>Reorder watch</span><strong>311 SKUs</strong><b>17%</b></div>
                  <div><i className={styles.critical}></i><span>Below minimum</span><strong>166 SKUs</strong><b>9%</b></div>
                </div>
              </div>
              <div className={styles.warehouseRows}>
                <button onClick={() => { setWarehouseFilter("MNL-A"); setView("inventory"); }}><Warehouse size={16} /><div><strong>Manila A · Technology</strong><span>684 SKUs · ₱3.86M value</span><ProgressBar value={96} /></div><b>96%</b><ChevronRight size={15} /></button>
                <button onClick={() => { setWarehouseFilter("MNL-B"); setView("inventory"); }}><Warehouse size={16} /><div><strong>Manila B · General supply</strong><span>742 SKUs · ₱2.91M value</span><ProgressBar value={89} /></div><b>89%</b><ChevronRight size={15} /></button>
                <button onClick={() => { setWarehouseFilter("CEB-01"); setView("inventory"); }}><Warehouse size={16} /><div><strong>Cebu 01 · Regional hub</strong><span>416 SKUs · ₱1.65M value</span><ProgressBar value={93} /></div><b>93%</b><ChevronRight size={15} /></button>
              </div>
            </Panel>

            <div className={styles.sideStack}>
              <Panel eyebrow="Inbound desk" title="Arrivals today" action={<button className={styles.textButton} onClick={() => setView("receiving")}>Open receiving <ArrowRight size={13} /></button>}>
                <div className={styles.arrivalList}>{receipts.map((receipt) => <button key={receipt.id} onClick={() => { setSelectedReceipt(receipt.id); setView("receiving"); }}>
                  <div className={styles.timeBlock}><strong>{receipt.eta}</strong><span>{receipt.dock}</span></div>
                  <div><strong>{receipt.supplier}</strong><span>{receipt.po} · {receipt.cartons} cartons</span></div>
                  <StatusBadge tone={receipt.status === "Counting" ? "info" : "neutral"}>{receipt.status}</StatusBadge>
                  <ChevronRight size={14} />
                </button>)}</div>
              </Panel>

              <Panel eyebrow="Buying signals" title="Seven-day stock movement">
                <div className={styles.movementChart}>
                  <div><span>Units issued</span><strong>4,281</strong><b>+12.8%</b></div>
                  <Sparkline values={[420, 510, 482, 630, 585, 712, 686, 744, 701, 780, 842, 816]} label="Units issued over the last seven days" />
                  <footer><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>TODAY</span></footer>
                </div>
              </Panel>
            </div>
          </div>

          <div className="dashboard-grid equal">
            <Panel eyebrow="Exception queue" title="Replenishment required" action={<button className={styles.textButton} onClick={() => { setWarehouseFilter("All"); setView("inventory"); }}>Review all <ArrowRight size={13} /></button>}>
              <div className={styles.lowStockList}>{inventory.filter((item) => item.onHand < item.reorder).slice(0, 4).map((item) => <button key={item.sku} onClick={() => { setSelectedSku(item.sku); setView("inventory"); }}>
                <div className={styles.productGlyph}><Boxes size={16} /></div><div><strong>{item.name}</strong><span>{item.sku} · {item.warehouse} / {item.bin}</span></div><div><strong>{item.onHand}</strong><span>min {item.reorder}</span></div><StatusBadge tone={item.onHand < item.reorder / 2 ? "danger" : "warn"}>{item.onHand < item.reorder / 2 ? "Critical" : "Reorder"}</StatusBadge>
              </button>)}</div>
            </Panel>
            <Panel eyebrow="Supplier pulse" title="Vendor performance">
              <div className={styles.supplierList}>{suppliers.map((supplier) => <article key={supplier.name}><div className="avatar">{supplier.initials}</div><div><strong>{supplier.name}</strong><span>{supplier.spend} YTD spend · {supplier.open} open POs</span></div><div><strong>{supplier.onTime}%</strong><span>on-time</span></div></article>)}</div>
            </Panel>
          </div>
        </div>
      )}

      {view === "inventory" && (
        <div className={styles.viewStack}>
          <div className={styles.toolbar}>
            <label className={styles.searchField}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by SKU, item, category, or supplier" /></label>
            <label className={styles.selectField}><Filter size={14} /><span>Warehouse</span><select value={warehouseFilter} onChange={(event) => setWarehouseFilter(event.target.value as typeof warehouseFilter)}><option>All</option><option>MNL-A</option><option>MNL-B</option><option>CEB-01</option></select></label>
            <span className={styles.resultCount}>{visibleInventory.length} sample records</span>
          </div>
          <div className={styles.inventoryWorkspace}>
            <Panel eyebrow="Perpetual inventory" title="Stock ledger" className={styles.stockTablePanel}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Item</th><th>Location</th><th>On hand</th><th>Available</th><th>Unit cost</th><th>Movement</th><th>Health</th></tr></thead>
                  <tbody>{visibleInventory.map((item) => {
                    const healthy = item.onHand >= item.reorder;
                    return <tr key={item.sku} className={`${styles.stockRow} ${selectedSku === item.sku ? styles.selected : ""}`} onClick={() => setSelectedSku(item.sku)}>
                      <td><strong>{item.name}</strong><small>{item.sku} · {item.category}</small></td>
                      <td><strong>{item.warehouse}</strong><small>Bin {item.bin}</small></td>
                      <td><strong>{item.onHand}</strong><small>Min {item.reorder}</small></td>
                      <td><strong>{item.available}</strong><small>{item.onHand - item.available} committed</small></td>
                      <td><strong>{peso(item.unitCost)}</strong><small>weighted avg.</small></td>
                      <td><div className={styles.miniSpark}><Sparkline values={item.movement} label={`${item.name} stock movement`} /></div></td>
                      <td><StatusBadge tone={healthy ? "good" : item.onHand < item.reorder / 2 ? "danger" : "warn"}>{healthy ? "Healthy" : "Reorder"}</StatusBadge></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            </Panel>

            <aside className={styles.itemDetail}>
              <div className={styles.detailIcon}><PackageOpen size={22} /></div><span>{focusedItem.sku}</span><h2>{focusedItem.name}</h2><p>{focusedItem.category} · Supplied by {focusedItem.supplier}</p>
              <div className={styles.quantityGrid}><div><span>On hand</span><strong>{focusedItem.onHand}</strong></div><div><span>Available</span><strong>{focusedItem.available}</strong></div><div><span>Reorder at</span><strong>{focusedItem.reorder}</strong></div><div><span>Stock value</span><strong>{peso(focusedItem.onHand * focusedItem.unitCost)}</strong></div></div>
              <dl><div><dt>Warehouse</dt><dd>{focusedItem.warehouse}</dd></div><div><dt>Bin location</dt><dd>{focusedItem.bin}</dd></div><div><dt>Unit cost</dt><dd>{peso(focusedItem.unitCost)}</dd></div><div><dt>Last count</dt><dd>{inventoryActivity[focusedItem.sku] || "26 Oct - exact"}</dd></div></dl>
              <WorkflowButton action={role === "clerk" ? "stock:count" : role === "manager" ? "stock:adjust" : "movement:view"} recordId={focusedItem.sku} note={`Inventory action for ${focusedItem.name}`} className={role !== "purchaser" ? "primary" : ""} onSuccess={() => {
                if (role === "manager") {
                  setAdjustments((current) => ({ ...current, [focusedItem.sku]: (current[focusedItem.sku] || 0) + 1 }));
                  setInventoryActivity((current) => ({ ...current, [focusedItem.sku]: "Inventory adjusted +1 just now" }));
                } else if (role === "clerk") {
                  setInventoryActivity((current) => ({ ...current, [focusedItem.sku]: "Count recorded just now - exact" }));
                } else {
                  setInventoryActivity((current) => ({ ...current, [focusedItem.sku]: "Movement ledger opened - 7 checkpoints shown" }));
                }
              }}>{role === "clerk" ? <ClipboardCheck size={14} /> : role === "manager" ? <TrendingUp size={14} /> : <ArrowDownToLine size={14} />} {role === "clerk" ? "Record cycle count" : role === "manager" ? "Adjust +1 demo unit" : "View movement ledger"}</WorkflowButton>
              <small className={styles.roleHint} aria-live="polite">{inventoryActivity[focusedItem.sku] || `Server permission: ${role === "clerk" ? "stock:count" : role === "manager" ? "stock:adjust" : "movement:view"}`}</small>
            </aside>
          </div>
        </div>
      )}

      {view === "orders" && (
        <div className={styles.viewStack}>
          <div className={styles.orderSummary}>
            <div><ShoppingCart size={18} /><span>Open orders</span><strong>{12 + createdOrderCount}</strong></div><div><CircleDollarSign size={18} /><span>Committed value</span><strong>₱1.16M</strong></div><div><CalendarClock size={18} /><span>Due this week</span><strong>07</strong></div><div><TriangleAlert size={18} /><span>Needs approval</span><strong>{2 + purchaseOrders.filter((order) => order.id.startsWith("PO-DEMO-") && order.status === "Awaiting approval").length}</strong></div>
          </div>
          <div className={styles.orderWorkspace}>
            <Panel eyebrow="Procurement ledger" title="Purchase orders">
              <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Supplier</th><th>Issued / due</th><th>Lines</th><th>Value</th><th>Status</th></tr></thead><tbody>{purchaseOrders.map((order) => <tr key={order.id} onClick={() => setSelectedPo(order.id)} className={`${styles.stockRow} ${selectedPo === order.id ? styles.selected : ""}`}><td><strong>{order.id}</strong><small>Owner · {order.owner}</small></td><td><strong>{order.supplier}</strong><small>Verified vendor</small></td><td><strong>{order.issued}</strong><small>Due {order.due}</small></td><td><strong>{order.lines}</strong><small>line items</small></td><td><strong>{peso(order.amount)}</strong><small>excl. tax</small></td><td><StatusBadge tone={poTone(order.status)}>{order.status}</StatusBadge></td></tr>)}</tbody></table></div>
            </Panel>
            <aside className={styles.poDetail}>
              <header><div className={styles.detailIcon}><ShoppingCart size={20} /></div><StatusBadge tone={poTone(focusedPo.status)}>{focusedPo.status}</StatusBadge></header>
              <span>{focusedPo.id}</span><h2>{focusedPo.supplier}</h2><p>{focusedPo.lines} line items · Owned by {focusedPo.owner}</p>
              <div className={styles.poAmount}><span>Order total</span><strong>{peso(focusedPo.amount)}</strong><small>Tax calculated on receipt</small></div>
              <div className={styles.poSteps}><p className={styles.done}><i><Check size={11} /></i><span><strong>Draft prepared</strong>{focusedPo.issued} · {focusedPo.owner}</span></p><p className={poApproved ? styles.done : poSubmitted ? styles.current : ""}><i>{poApproved ? <Check size={11} /> : "2"}</i><span><strong>Manager approval</strong>{poApproved ? "Approved" : poSubmitted ? "Decision required" : "Waiting for submission"}</span></p><p className={focusedPo.status === "Received" ? styles.done : ""}><i>{focusedPo.status === "Received" ? <Check size={11} /> : "3"}</i><span><strong>Supplier fulfilment</strong>{focusedPo.due === "Not set" ? "Due date not set" : `Expected by ${focusedPo.due}`}</span></p></div>
              <WorkflowButton action={role === "manager" ? "purchase:approve" : role === "purchaser" ? "purchase:submit" : "movement:view"} recordId={focusedPo.id} note={`Purchase order action for ${focusedPo.id}`} className={role !== "clerk" ? "primary" : ""} onSuccess={() => {
                if (role === "manager") {
                  setPurchaseOrders((current) => current.map((order) => order.id === focusedPo.id ? { ...order, status: "Approved" } : order));
                  setOrderActivity((current) => ({ ...current, [focusedPo.id]: "Approved just now - supplier fulfilment unlocked" }));
                } else if (role === "purchaser") {
                  setPurchaseOrders((current) => current.map((order) => order.id === focusedPo.id ? { ...order, status: "Awaiting approval" } : order));
                  setOrderActivity((current) => ({ ...current, [focusedPo.id]: "Submitted just now - manager decision required" }));
                } else {
                  setOrderActivity((current) => ({ ...current, [focusedPo.id]: `Stock commitments opened - ${focusedPo.lines} linked lines` }));
                }
              }}>{role === "manager" ? <CheckCircle2 size={14} /> : role === "purchaser" ? <ArrowRight size={14} /> : <ArrowDownToLine size={14} />} {role === "manager" ? "Approve purchase order" : role === "purchaser" ? "Submit for approval" : "View stock commitments"}</WorkflowButton>
              <small className={styles.roleHint} aria-live="polite">{orderActivity[focusedPo.id] || "Switch roles to demonstrate submit and approval separation."}</small>
            </aside>
          </div>
        </div>
      )}

      {view === "receiving" && (
        <div className={styles.viewStack}>
          <section className={styles.receivingHero}>
            <div><span>Receiving day · 28 Oct</span><h2>Three deliveries. <em>One clean handoff.</em></h2><p>Match purchase orders, count physical goods, flag variances, and post accepted stock into the available ledger.</p></div>
            <div className={styles.dockStat}><Truck size={24} /><strong>86</strong><span>cartons expected</span></div>
          </section>
          <div className={styles.receivingWorkspace}>
            <div className={styles.receiptList}>{receipts.map((receipt, index) => {
              const completed = receivedLines[receipt.id] ?? receipt.received;
              return <button key={receipt.id} className={selectedReceipt === receipt.id ? styles.selected : ""} onClick={() => setSelectedReceipt(receipt.id)}><span className={styles.receiptIndex}>0{index + 1}</span><div><strong>{receipt.supplier}</strong><span>{receipt.id} · {receipt.po}</span></div><div><strong>{receipt.eta}</strong><span>{receipt.dock}</span></div><div><ProgressBar value={completed} max={receipt.lines} label={`${completed}/${receipt.lines} lines`} /></div><ChevronRight size={16} /></button>;
            })}</div>
            <aside className={styles.receiptDetail}>
              <header><div><span>Active receipt</span><strong>{focusedReceipt.id}</strong></div><StatusBadge tone={focusedReceived === focusedReceipt.lines ? "good" : focusedReceived ? "info" : "neutral"}>{focusedReceived === focusedReceipt.lines ? "Completed" : focusedReceived ? "Counting" : focusedReceipt.status}</StatusBadge></header>
              <div className={styles.receiptIdentity}><div className={styles.detailIcon}><Container size={22} /></div><div><h2>{focusedReceipt.supplier}</h2><p>{focusedReceipt.po} · {focusedReceipt.cartons} cartons</p></div></div>
              <div className={styles.receiptProgress}><div><span>Line verification</span><strong>{focusedReceived} / {focusedReceipt.lines}</strong></div><ProgressBar value={focusedReceived} max={focusedReceipt.lines} /></div>
              <div className={styles.receiptChecklist}><p className={styles.done}><i><Check size={12} /></i><span>Purchase order matched</span></p><p className={focusedReceived > 0 ? styles.done : ""}><i>{focusedReceived > 0 ? <Check size={12} /> : "2"}</i><span>Physical count recorded</span></p><p className={focusedReceived === focusedReceipt.lines ? styles.done : ""}><i>{focusedReceived === focusedReceipt.lines ? <Check size={12} /> : "3"}</i><span>Stock posted to ledger</span></p></div>
              <WorkflowButton action={role === "clerk" ? "stock:receive" : role === "manager" ? "stock:adjust" : "purchase:submit"} recordId={focusedReceipt.id} note={`Receiving workflow for ${focusedReceipt.id}`} className="primary" onSuccess={() => {
                if (role === "clerk") {
                  const nextReceived = Math.min(focusedReceipt.lines, focusedReceived + 1);
                  setReceivedLines((current) => ({ ...current, [focusedReceipt.id]: nextReceived }));
                  setReceiptActivity((current) => ({ ...current, [focusedReceipt.id]: nextReceived === focusedReceipt.lines ? "Receipt completed - stock posted to ledger" : `Line ${nextReceived} of ${focusedReceipt.lines} verified just now` }));
                } else if (role === "manager") {
                  setReceiptActivity((current) => ({ ...current, [focusedReceipt.id]: "Variance adjustment posted just now" }));
                } else {
                  setReceiptActivity((current) => ({ ...current, [focusedReceipt.id]: "Receipt variance submitted just now" }));
                }
              }}><PackageCheck size={14} /> {role === "clerk" ? "Verify next line" : role === "manager" ? "Post variance adjustment" : "Submit receipt variance"}</WorkflowButton>
              <small className={styles.roleHint} aria-live="polite">{receiptActivity[focusedReceipt.id] || "Each successful action updates this receipt in the current demo session."}</small>
            </aside>
          </div>
          {events.length > 0 && <div className={styles.auditRibbon}><PackageCheck size={15} /><div><strong>Latest recorded action</strong><span>{events[0].action.replaceAll(":", " ")} · {events[0].actorName}</span></div><time>{new Date(events[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>}
        </div>
      )}
    </>
  );
}

export default function StockFlowPage() {
  return <SystemShell systemId="stockflow" activeArea="Supply control tower"><StockFlowWorkspace /></SystemShell>;
}
