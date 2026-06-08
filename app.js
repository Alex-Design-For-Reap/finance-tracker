import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const EXPENSE_SECTIONS = ["Daily Expenses", "Financial Obligations", "Splurge", "Smile"];
const INCOME_SECTION = "Income";
const INVESTMENT_SECTION = "Investments / Savings";
const ENTRY_TYPES = {
  expense: "Expense",
  credit: "Refund/Credit",
  reserve: "Reserve used",
};
const ANNUAL_RETURN_RATE = 0.1;
const PAY_CYCLE_START_DAY = 14;
const SUPABASE_URL = "https://cqbtorlmiqdpcoxqnrjy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYnRvcmxtaXFkcGNveHFucmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjM4NTIsImV4cCI6MjA5NDI5OTg1Mn0.2zZTXBFND6bXTksO6M8KmM0SlKBl8N9cD_mtKaajW6c";
const ENTRIES_TABLE = "finance_entries";
const PLAN_OVERRIDES_TABLE = "finance_plan_overrides";
const PLAN_DATA_TABLE = "finance_plan_data";
const RECURRING_TABLE = "finance_recurring_items";
const STORAGE_KEY = "finance-tracker-dated-entries:v2";
const RECURRING_STORAGE_KEY = "finance-tracker-recurring-items:v1";
const LEGACY_STORAGE_KEY = "weekly-finance-tracker:v1";
const PLAN_STORAGE_KEY = "finance-tracker-plan-overrides:v2";
const HISTORICAL_SEED_KEY = "finance-tracker-historical-actuals:v2";
const HISTORICAL_ACTUAL_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"];
const RECURRENCE_FREQUENCIES = {
  weekly: { label: "Weekly", days: 7 },
  fortnightly: { label: "Fortnightly", days: 14 },
  monthly: { label: "Monthly", months: 1 },
  bimonthly: { label: "Bi-monthly", months: 2 },
  quarterly: { label: "Quarterly", months: 3 },
  biannually: { label: "Biannually", months: 6 },
  annually: { label: "Annually", months: 12 },
};
const RECURRING_FLOWS = {
  expense: "Expense",
  income: "Income",
  saving: "Savings / Investment",
};
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (window.location.protocol === "file:") {
  window.location.replace("http://127.0.0.1:8000/");
}

const els = {
  authPanel: document.querySelector("#authPanel"),
  authForm: document.querySelector("#authForm"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authButton: document.querySelector("#authButton"),
  magicLinkButton: document.querySelector("#magicLinkButton"),
  signedInPanel: document.querySelector("#signedInPanel"),
  signedInEmail: document.querySelector("#signedInEmail"),
  signOutButton: document.querySelector("#signOutButton"),
  authMessage: document.querySelector("#authMessage"),
  trackerControls: document.querySelector("#trackerControls"),
  appViewSwitch: document.querySelector("#appViewSwitch"),
  viewSwitchButtons: document.querySelectorAll("[data-app-view]"),
  dashboardSummary: document.querySelector("#dashboardSummary"),
  dashboardWorkbench: document.querySelector("#dashboardWorkbench"),
  upcomingView: document.querySelector("#upcomingView"),
  forecastHorizonSelect: document.querySelector("#forecastHorizonSelect"),
  addRecurringButton: document.querySelector("#addRecurringButton"),
  forecastMoneyIn: document.querySelector("#forecastMoneyIn"),
  forecastMoneyInLabel: document.querySelector("#forecastMoneyInLabel"),
  forecastMoneyOut: document.querySelector("#forecastMoneyOut"),
  forecastMoneyOutLabel: document.querySelector("#forecastMoneyOutLabel"),
  forecastSaved: document.querySelector("#forecastSaved"),
  forecastSavedLabel: document.querySelector("#forecastSavedLabel"),
  forecastBalanceCard: document.querySelector("#forecastBalanceCard"),
  forecastBalance: document.querySelector("#forecastBalance"),
  forecastBalanceLabel: document.querySelector("#forecastBalanceLabel"),
  occurrenceCountBadge: document.querySelector("#occurrenceCountBadge"),
  upcomingOccurrenceList: document.querySelector("#upcomingOccurrenceList"),
  recurringCountBadge: document.querySelector("#recurringCountBadge"),
  recurringScheduleList: document.querySelector("#recurringScheduleList"),
  periodModeSelect: document.querySelector("#periodModeSelect"),
  periodSelect: document.querySelector("#periodSelect"),
  entryDateInput: document.querySelector("#entryDateInput"),
  actualInput: document.querySelector("#actualInput"),
  entryTypeSelect: document.querySelector("#entryTypeSelect"),
  categorySelect: document.querySelector("#categorySelect"),
  subcategorySelect: document.querySelector("#subcategorySelect"),
  saveButton: document.querySelector("#saveButton"),
  viewEntriesButton: document.querySelector("#viewEntriesButton"),
  bulkEntriesButton: document.querySelector("#bulkEntriesButton"),
  editPlanButton: document.querySelector("#editPlanButton"),
  closeEntriesButton: document.querySelector("#closeEntriesButton"),
  closeBulkButton: document.querySelector("#closeBulkButton"),
  entryModal: document.querySelector("#entryModal"),
  entryModalTitle: document.querySelector("#entryModalTitle"),
  entryModalSummary: document.querySelector("#entryModalSummary"),
  bulkModal: document.querySelector("#bulkModal"),
  bulkModalSummary: document.querySelector("#bulkModalSummary"),
  bulkEntryRows: document.querySelector("#bulkEntryRows"),
  addBulkRowButton: document.querySelector("#addBulkRowButton"),
  saveBulkButton: document.querySelector("#saveBulkButton"),
  planModal: document.querySelector("#planModal"),
  closePlanButton: document.querySelector("#closePlanButton"),
  planMonthSelect: document.querySelector("#planMonthSelect"),
  planSectionSelect: document.querySelector("#planSectionSelect"),
  planEditorList: document.querySelector("#planEditorList"),
  savePlanButton: document.querySelector("#savePlanButton"),
  resetPlanButton: document.querySelector("#resetPlanButton"),
  recurringModal: document.querySelector("#recurringModal"),
  recurringForm: document.querySelector("#recurringForm"),
  recurringModalTitle: document.querySelector("#recurringModalTitle"),
  recurringIdInput: document.querySelector("#recurringIdInput"),
  recurringNameInput: document.querySelector("#recurringNameInput"),
  recurringFlowSelect: document.querySelector("#recurringFlowSelect"),
  recurringAmountInput: document.querySelector("#recurringAmountInput"),
  recurringFrequencySelect: document.querySelector("#recurringFrequencySelect"),
  recurringDueDateInput: document.querySelector("#recurringDueDateInput"),
  recurringCategorySelect: document.querySelector("#recurringCategorySelect"),
  recurringSubcategorySelect: document.querySelector("#recurringSubcategorySelect"),
  closeRecurringButton: document.querySelector("#closeRecurringButton"),
  cancelRecurringButton: document.querySelector("#cancelRecurringButton"),
  targetTitle: document.querySelector("#targetTitle"),
  weeklyTarget: document.querySelector("#weeklyTarget"),
  targetBasis: document.querySelector("#targetBasis"),
  actualSaved: document.querySelector("#actualSaved"),
  savedLabel: document.querySelector("#savedLabel"),
  varianceValue: document.querySelector("#varianceValue"),
  varianceCopy: document.querySelector("#varianceCopy"),
  varianceCard: document.querySelector("#varianceCard"),
  monthlyPlan: document.querySelector("#monthlyPlan"),
  incomeLabel: document.querySelector("#incomeLabel"),
  categoryList: document.querySelector("#categoryList"),
  monthBadge: document.querySelector("#monthBadge"),
  entryReportBadge: document.querySelector("#entryReportBadge"),
  entryReportList: document.querySelector("#entryReportList"),
  trendChart: document.querySelector("#trendChart"),
  incomeValue: document.querySelector("#incomeValue"),
  expensesValue: document.querySelector("#expensesValue"),
  savingsValue: document.querySelector("#savingsValue"),
  investmentBadge: document.querySelector("#investmentBadge"),
  monthlyInvestment: document.querySelector("#monthlyInvestment"),
  accumulatedInvestment: document.querySelector("#accumulatedInvestment"),
  compoundInvestment: document.querySelector("#compoundInvestment"),
  investmentRows: document.querySelector("#investmentRows"),
  entryList: document.querySelector("#entryList"),
  syncStatus: document.querySelector("#syncStatus"),
};

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

let financeData;
let periods = [];
let entries = loadEntries();
let recurringItems = loadRecurringItems();
let planOverrides = loadPlanOverrides();
let currentUser = null;
let dashboardReady = false;
let deletedBulkEntryIds = new Set();
let entryModalContext = null;
let activeAppView = "dashboard";

init();

async function init() {
  setupAuthListeners();
  setupTrackerListeners();
  await hydrateAuthState();
  await initializeDashboard();
}

function setupTrackerListeners() {
  els.viewSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => setAppView(button.dataset.appView));
  });
  els.periodModeSelect.addEventListener("change", () => {
    els.entryDateInput.value = getDefaultEntryDateKey();
    populatePeriodOptions(els.entryDateInput.value);
  });
  els.periodSelect.addEventListener("change", syncDateToPeriod);
  els.entryDateInput.addEventListener("change", syncPeriodToDate);
  els.entryTypeSelect.addEventListener("change", updateLiveVariance);
  els.categorySelect.addEventListener("change", () => {
    populateSubcategoryOptions();
    updateLiveVariance();
  });
  els.actualInput.addEventListener("input", updateLiveVariance);
  els.saveButton.addEventListener("click", saveEntry);
  els.viewEntriesButton.addEventListener("click", openEntryModal);
  els.bulkEntriesButton.addEventListener("click", openBulkModal);
  els.editPlanButton.addEventListener("click", openPlanModal);
  els.closeEntriesButton.addEventListener("click", closeEntryModal);
  els.closeBulkButton.addEventListener("click", closeBulkModal);
  els.closePlanButton.addEventListener("click", closePlanModal);
  els.addBulkRowButton.addEventListener("click", () => addBulkRow());
  els.saveBulkButton.addEventListener("click", saveBulkEntries);
  els.planMonthSelect.addEventListener("change", renderPlanEditor);
  els.planSectionSelect.addEventListener("change", renderPlanEditor);
  els.savePlanButton.addEventListener("click", savePlanEditor);
  els.resetPlanButton.addEventListener("click", resetPlanSection);
  els.forecastHorizonSelect.addEventListener("change", renderUpcoming);
  els.addRecurringButton.addEventListener("click", () => openRecurringModal());
  els.closeRecurringButton.addEventListener("click", closeRecurringModal);
  els.cancelRecurringButton.addEventListener("click", closeRecurringModal);
  els.recurringFlowSelect.addEventListener("change", syncRecurringFlowDefaults);
  els.recurringCategorySelect.addEventListener("change", () => {
    populateSubcategorySelect(els.recurringSubcategorySelect, els.recurringCategorySelect.value);
  });
  els.recurringForm.addEventListener("submit", saveRecurringItem);
  els.entryModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) closeEntryModal();
  });
  els.planModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-plan-modal]")) closePlanModal();
  });
  els.bulkModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-bulk-modal]")) closeBulkModal();
  });
  els.recurringModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-recurring-modal]")) closeRecurringModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEntryModal();
      closeBulkModal();
      closePlanModal();
      closeRecurringModal();
    }
  });
}

function setupAuthListeners() {
  els.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = els.authEmailInput.value.trim();
    const password = els.authPasswordInput.value;
    if (!email || !password) {
      els.authMessage.textContent = "Enter your email and password, or use the login link button.";
      return;
    }

    await runAuthAction(els.authButton, "Signing in...", () =>
      signInWithPassword(email, password),
    );
  });

  els.magicLinkButton.addEventListener("click", async () => {
    const email = els.authEmailInput.value.trim();
    if (!email) {
      els.authMessage.textContent = "Enter your email first.";
      return;
    }

    const result = await runAuthAction(els.magicLinkButton, "Sending login link...", () =>
      supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href.split("#")[0],
        },
      }),
    );

    if (result?.ok) {
      els.authMessage.textContent = "Check your email and open the login link on this device.";
    }
  });

  els.signOutButton.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
    if (currentUser) {
      initializeDashboard();
    } else {
      dashboardReady = false;
      financeData = null;
      periods = [];
      updateDashboardVisibility();
      closeEntryModal();
      closeBulkModal();
      closePlanModal();
      closeRecurringModal();
    }
  });
}

async function runAuthAction(button, waitingMessage, action) {
  button.disabled = true;
  els.authMessage.textContent = waitingMessage;
  try {
    const result = await withTimeout(action(), 30000);
    if (result.error) {
      els.authMessage.textContent = result.error.message;
      return { ok: false };
    }
    if (result.data?.session) {
      applySession(result.data.session);
      await initializeDashboard();
    }
    return { ok: true };
  } catch (error) {
    els.authMessage.textContent =
      "Supabase did not respond. Check your connection and Supabase Auth settings, then try again.";
    return { ok: false };
  } finally {
    button.disabled = false;
  }
}

async function signInWithPassword(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      error: {
        message: payload.msg || payload.error_description || payload.error || "Sign in failed.",
      },
    };
  }

  return supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Timed out")), ms);
    }),
  ]);
}

async function hydrateAuthState() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    els.authMessage.textContent = error.message;
    return;
  }
  applySession(data.session);
}

function applySession(session) {
  currentUser = session?.user ?? null;
  const email = currentUser?.email || "";

  els.authForm.hidden = Boolean(currentUser);
  els.signedInPanel.hidden = !currentUser;
  updateDashboardVisibility();
  els.signedInEmail.textContent = email ? `Signed in as ${email}` : "Signed in";
  els.authMessage.textContent = currentUser
    ? "Private sync is active for this account."
    : "Sign in to sync privately across devices.";
}

async function initializeDashboard() {
  if (!currentUser || dashboardReady) return;

  setSyncStatus("Loading private plan...", "warning");
  financeData = await loadPrivateFinanceData();
  if (!financeData) return;

  seedHistoricalActualEntries();
  await hydrateFromSupabase();

  populateCategoryOptions();
  populatePlanOptions();
  populateRecurringCategoryOptions();
  els.entryDateInput.value = getDefaultEntryDateKey();
  els.recurringDueDateInput.value = els.entryDateInput.value;
  populatePeriodOptions(els.entryDateInput.value);
  dashboardReady = true;
  updateDashboardVisibility();
  render();
}

function updateDashboardVisibility() {
  const canShowDashboard = Boolean(currentUser && dashboardReady && financeData);
  els.trackerControls.hidden = !canShowDashboard;
  els.appViewSwitch.hidden = !canShowDashboard;
  els.dashboardSummary.hidden = !canShowDashboard || activeAppView !== "dashboard";
  els.dashboardWorkbench.hidden = !canShowDashboard || activeAppView !== "dashboard";
  els.upcomingView.hidden = !canShowDashboard || activeAppView !== "upcoming";
}

function render() {
  if (!currentUser || !financeData || !periods.length) return;

  const period = getSelectedPeriod();
  const periodEntries = getEntriesForPeriod(period);
  const expenseEntries = periodEntries.filter((entry) => isExpenseCategory(entry.category));
  const moneyOutEntries = expenseEntries.filter((entry) => getEntryType(entry) === "expense");
  const moneyInEntries = periodEntries.filter(isMoneyInEntry);
  const savedEntries = periodEntries.filter((entry) => entry.category === INVESTMENT_SECTION);
  const moneyOutTotal = sumEntries(moneyOutEntries);
  const moneyInTotal = sumEntries(moneyInEntries);
  const savedTotal = sumEntries(savedEntries);
  const target = getBudgetForRange(period.start, period.end, getExpenseSections());

  els.actualInput.value = "";
  els.targetTitle.textContent = "Money saved / invested";
  els.monthBadge.textContent = period.label;
  els.weeklyTarget.textContent = money(savedTotal);
  els.targetBasis.textContent = savedEntries.length
    ? `${savedEntries.length} ${savedEntries.length === 1 ? "saving/investment entry" : "saving/investment entries"} in this period`
    : "No savings or investment entries yet";
  els.actualSaved.textContent = money(moneyOutTotal);
  els.savedLabel.textContent = moneyOutEntries.length
    ? `${moneyOutEntries.length} ${moneyOutEntries.length === 1 ? "expense" : "expenses"} in this period`
    : "No money out yet";
  els.viewEntriesButton.textContent = periodEntries.length
    ? `See list of entries (${periodEntries.length})`
    : "See list of entries";
  els.monthlyPlan.textContent = money(moneyInTotal);
  els.incomeLabel.textContent = moneyInEntries.length
    ? `${moneyInEntries.length} ${moneyInEntries.length === 1 ? "money in entry" : "money in entries"} in this period`
    : "No money in yet";

  if (els.entryModal.getAttribute("aria-hidden") === "false" && entryModalContext) {
    renderEntryList(entryModalContext);
  } else {
    renderEntryList(createPeriodEntryContext(periodEntries));
  }
  renderCategories(period, target);
  renderEntryReport(period, periodEntries);
  renderTrend(period);
  renderMiniTable(period);
  renderInvestments(period, periodEntries);
  renderUpcoming();
  updateLiveVariance();
}

function setAppView(view) {
  activeAppView = view === "upcoming" ? "upcoming" : "dashboard";
  els.viewSwitchButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.appView === activeAppView);
  });
  updateDashboardVisibility();
  render();
}

function saveEntry() {
  const value = parseAmount(els.actualInput.value);
  if (!Number.isFinite(value) || value <= 0) {
    els.actualInput.focus();
    return;
  }

  entries.push({
    id: crypto.randomUUID(),
    amount: value,
    type: els.entryTypeSelect.value,
    date: els.entryDateInput.value,
    category: els.categorySelect.value,
    subcategory: els.subcategorySelect.value,
    createdAt: new Date().toISOString(),
  });
  saveEntries();
  syncPeriodToDate();
}

function updateLiveVariance() {
  if (!periods.length) return;
  const period = getSelectedPeriod();
  const periodEntries = getEntriesForPeriod(period);
  const moneyInEntries = periodEntries.filter(isMoneyInEntry);
  const moneyOutEntries = periodEntries.filter(
    (entry) => isExpenseCategory(entry.category) && getEntryType(entry) === "expense",
  );
  const savedEntries = periodEntries.filter((entry) => entry.category === INVESTMENT_SECTION);
  const draftAmount = parseAmount(els.actualInput.value);
  const draftEntry = {
    amount: Number.isFinite(draftAmount) ? draftAmount : 0,
    type: els.entryTypeSelect.value,
    category: els.categorySelect.value,
  };
  const draftMoneyIn = isMoneyInEntry(draftEntry) ? draftEntry.amount : 0;
  const draftMoneyOut =
    isExpenseCategory(draftEntry.category) && getEntryType(draftEntry) === "expense" ? draftEntry.amount : 0;
  const draftSaved = draftEntry.category === INVESTMENT_SECTION ? draftEntry.amount : 0;
  const moneyIn = sumEntries(moneyInEntries) + draftMoneyIn;
  const moneyOut = sumEntries(moneyOutEntries) + draftMoneyOut;
  const saved = sumEntries(savedEntries) + draftSaved;
  const variance = moneyIn - moneyOut - saved;
  const hasCashFlow =
    moneyInEntries.length > 0 || moneyOutEntries.length > 0 || savedEntries.length > 0 || draftAmount > 0;

  els.varianceValue.textContent = hasCashFlow ? money(variance) : "$0";
  els.varianceCard.classList.toggle("is-good", hasCashFlow && variance >= 0);
  els.varianceCard.classList.toggle("is-over", hasCashFlow && variance < 0);
  els.varianceCopy.textContent = hasCashFlow
    ? variance > 0
      ? `${money(variance)} cash-flow surplus`
      : variance < 0
        ? `${money(Math.abs(variance))} cash-flow deficit`
        : "Money in covers money out and saved/invested"
    : "Add money in, money out, or saved/invested to compare";
}

function renderEntryList(context = entryModalContext || createPeriodEntryContext()) {
  entryModalContext = context;
  const periodEntries = context.getEntries();
  els.entryModalTitle.textContent = context.title;
  els.entryList.replaceChildren();
  renderEntryModalSummary(context, periodEntries);

  if (!periodEntries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "No entries have been added for this period yet.";
    els.entryList.append(empty);
    return;
  }

  periodEntries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "entry-row";
      row.innerHTML = `
        <span>
          <b>${formatDisplayDate(entry.date)}</b>
          <small>${entry.category || "Unclassified"} · ${entry.subcategory || "No subcategory"} · ${getEntryTypeLabel(entry)}</small>
        </span>
        <strong class="${getEntryImpact(entry) < 0 ? "entry-credit" : ""}">${formatEntryAmount(entry)}</strong>
        <button type="button" aria-label="Edit entry ${index + 1}">Edit</button>
        <button type="button" aria-label="Remove entry ${index + 1}">Remove</button>
      `;
      row.querySelector(`[aria-label="Edit entry ${index + 1}"]`).addEventListener("click", () => renderEditEntry(entry, context));
      row.querySelector(`[aria-label="Remove entry ${index + 1}"]`).addEventListener("click", () => removeEntry(entry.id));
      els.entryList.append(row);
    });
}

function createPeriodEntryContext(periodEntries = null) {
  return {
    title: "Spend list",
    getEntries: () => periodEntries || getEntriesForPeriod(getSelectedPeriod()),
    getSummary: (items) => `${getSelectedPeriod().label} · ${money(sumEntries(items))} total entries`,
    getDefaults: () => ({
      date: els.entryDateInput.value,
      type: els.entryTypeSelect.value,
      category: els.categorySelect.value,
      subcategory: els.subcategorySelect.value,
    }),
  };
}

function createReportEntryContext({ title, category, subcategory = "" }) {
  return {
    title,
    getEntries: () =>
      getEntriesForPeriod(getSelectedPeriod()).filter((entry) => {
        const categoryMatches = (entry.category || "Unclassified") === category;
        const subcategoryMatches = !subcategory || (entry.subcategory || "No subcategory") === subcategory;
        return categoryMatches && subcategoryMatches;
      }),
    getSummary: (items) => {
      const total = items.reduce((sum, entry) => sum + getReportSignedAmount(entry), 0);
      return `${category} · ${money(Math.abs(total))} total · ${items.length} ${items.length === 1 ? "entry" : "entries"}`;
    },
    getDefaults: () => ({
      date: els.entryDateInput.value,
      type: "expense",
      category,
      subcategory: subcategory || getFirstSubcategory(category),
    }),
  };
}

function renderEntryModalSummary(context, periodEntries) {
  els.entryModalSummary.replaceChildren();

  const copy = document.createElement("span");
  copy.textContent = context.getSummary(periodEntries);

  const addButton = document.createElement("button");
  addButton.className = "secondary-button modal-add-button";
  addButton.type = "button";
  addButton.textContent = "Add row";
  addButton.addEventListener("click", () => renderEditEntry(null, context));

  els.entryModalSummary.append(copy, addButton);
}

function renderEditEntry(entry, context = entryModalContext || createPeriodEntryContext()) {
  entryModalContext = context;
  els.entryList.replaceChildren();
  els.entryModalSummary.replaceChildren();
  els.entryModalSummary.textContent = entry ? "Edit entry" : "Add entry";

  const form = document.createElement("form");
  form.className = "edit-entry-form";
  const defaults = context.getDefaults();
  form.innerHTML = `
    <label>
      Date
      <input name="date" type="date" value="${entry?.date || defaults.date}" required />
    </label>
    <label>
      Amount
      <input name="amount" type="text" inputmode="decimal" value="${entry?.amount ?? ""}" required />
    </label>
    <label>
      Type
      <select name="type"></select>
    </label>
    <label>
      Bucket
      <select name="category"></select>
    </label>
    <label>
      Subcategory
      <select name="subcategory"></select>
    </label>
    <div class="edit-actions">
      <button type="submit">Save changes</button>
      <button class="secondary-button" type="button" data-cancel-edit>Cancel</button>
    </div>
  `;

  const typeSelect = form.elements.type;
  const categorySelect = form.elements.category;
  const subcategorySelect = form.elements.subcategory;
  populateEntryTypeSelect(typeSelect, getEntryType(entry) || defaults.type);
  populateCategorySelect(categorySelect, entry?.category || defaults.category);
  populateSubcategorySelect(subcategorySelect, categorySelect.value, entry?.subcategory || defaults.subcategory);

  categorySelect.addEventListener("change", () => {
    populateSubcategorySelect(subcategorySelect, categorySelect.value);
  });
  form.querySelector("[data-cancel-edit]").addEventListener("click", () => {
    renderEntryList(context);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = parseAmount(form.elements.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) return;

    if (entry) {
      entries = entries.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              date: form.elements.date.value,
              amount,
              type: typeSelect.value,
              category: categorySelect.value,
              subcategory: subcategorySelect.value,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
    } else {
      entries.push({
        id: crypto.randomUUID(),
        amount,
        type: typeSelect.value,
        date: form.elements.date.value,
        category: categorySelect.value,
        subcategory: subcategorySelect.value,
        createdAt: new Date().toISOString(),
      });
    }
    saveEntries();
    syncPeriodToDateValue(form.elements.date.value);
  });

  els.entryList.append(form);
}

function removeEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  deleteSupabaseEntry(id);
  render();
}

function openBulkModal() {
  renderBulkEntries();
  els.bulkModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closeBulkButton.focus();
}

function closeBulkModal() {
  els.bulkModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderBulkEntries() {
  const period = getSelectedPeriod();
  const periodEntries = getEntriesForPeriod(period)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  deletedBulkEntryIds = new Set();

  els.bulkEntryRows.replaceChildren();
  els.bulkModalSummary.textContent = `${period.label} · edit existing entries or add several new rows`;

  const header = document.createElement("div");
  header.className = "bulk-entry-header";
  header.innerHTML = `
    <span>Date</span>
    <span>Amount</span>
    <span>Type</span>
    <span>Bucket</span>
    <span>Subcategory</span>
    <span></span>
  `;
  els.bulkEntryRows.append(header);

  periodEntries.forEach((entry) => addBulkRow(entry));
  const blankCount = Math.max(5 - periodEntries.length, 3);
  Array.from({ length: blankCount }).forEach(() => addBulkRow());
}

function addBulkRow(entry = null) {
  const row = document.createElement("div");
  row.className = "bulk-entry-row";
  if (entry?.id) row.dataset.entryId = entry.id;
  row.innerHTML = `
    <input class="bulk-date" type="date" value="${entry?.date || els.entryDateInput.value}" />
    <input class="bulk-amount" type="text" inputmode="decimal" value="${entry?.amount ?? ""}" placeholder="0.00" />
    <select class="bulk-type"></select>
    <select class="bulk-category"></select>
    <select class="bulk-subcategory"></select>
    <button class="secondary-button bulk-remove-button" type="button">Remove</button>
  `;

  const typeSelect = row.querySelector(".bulk-type");
  const categorySelect = row.querySelector(".bulk-category");
  const subcategorySelect = row.querySelector(".bulk-subcategory");
  populateEntryTypeSelect(typeSelect, getEntryType(entry) || els.entryTypeSelect.value);
  populateCategorySelect(categorySelect, entry?.category || els.categorySelect.value);
  populateSubcategorySelect(subcategorySelect, categorySelect.value, entry?.subcategory || els.subcategorySelect.value);
  categorySelect.addEventListener("change", () => populateSubcategorySelect(subcategorySelect, categorySelect.value));
  row.querySelector(".bulk-remove-button").addEventListener("click", () => {
    if (row.dataset.entryId) deletedBulkEntryIds.add(row.dataset.entryId);
    row.remove();
  });

  els.bulkEntryRows.append(row);
}

function saveBulkEntries() {
  const now = new Date().toISOString();
  const rows = [...els.bulkEntryRows.querySelectorAll(".bulk-entry-row")];
  const nextEntriesById = new Map(entries.map((entry) => [entry.id, entry]));

  deletedBulkEntryIds.forEach((id) => nextEntriesById.delete(id));

  rows.forEach((row) => {
    const amount = parseAmount(row.querySelector(".bulk-amount").value);
    const date = row.querySelector(".bulk-date").value;
    const type = row.querySelector(".bulk-type").value;
    const category = row.querySelector(".bulk-category").value;
    const subcategory = row.querySelector(".bulk-subcategory").value;
    const id = row.dataset.entryId;

    if (!date || !Number.isFinite(amount) || amount <= 0) return;

    if (id && nextEntriesById.has(id)) {
      nextEntriesById.set(id, {
        ...nextEntriesById.get(id),
        amount,
        date,
        type,
        category,
        subcategory,
        updatedAt: now,
      });
      return;
    }

    const newId = crypto.randomUUID();
    nextEntriesById.set(newId, {
      id: newId,
      amount,
      date,
      type,
      category,
      subcategory,
      createdAt: now,
    });
  });

  entries = [...nextEntriesById.values()];
  saveEntries();
  deletedBulkEntryIds.forEach((id) => deleteSupabaseEntry(id));
  deletedBulkEntryIds = new Set();
  syncPeriodToDate();
  renderBulkEntries();
}

function openEntryModal() {
  renderEntryList(createPeriodEntryContext());
  els.entryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closeEntriesButton.focus();
}

function closeEntryModal() {
  els.entryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  entryModalContext = null;
}

function openPlanModal() {
  const period = getSelectedPeriod();
  const selectedMonth = getMonthKeyForDate(period.start);
  if (selectedMonth) els.planMonthSelect.value = selectedMonth;
  renderPlanEditor();
  els.planModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closePlanButton.focus();
}

function closePlanModal() {
  els.planModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openRecurringModal(item = null) {
  els.recurringModalTitle.textContent = item ? "Edit recurring item" : "Add recurring item";
  els.recurringIdInput.value = item?.id || "";
  els.recurringNameInput.value = item?.name || "";
  els.recurringAmountInput.value = item?.amount ?? "";
  els.recurringFrequencySelect.value = item?.frequency || "monthly";
  els.recurringDueDateInput.value = item?.nextDueDate || els.entryDateInput.value || getDefaultEntryDateKey();
  els.recurringFlowSelect.value = item?.flow || "expense";
  populateCategorySelect(els.recurringCategorySelect, item?.category || getRecurringDefaultCategory(els.recurringFlowSelect.value));
  populateSubcategorySelect(
    els.recurringSubcategorySelect,
    els.recurringCategorySelect.value,
    item?.subcategory || getFirstSubcategory(els.recurringCategorySelect.value),
  );
  els.recurringModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.recurringNameInput.focus();
}

function closeRecurringModal() {
  els.recurringModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  els.recurringForm.reset();
  els.recurringIdInput.value = "";
}

function saveRecurringItem(event) {
  event.preventDefault();
  const amount = parseAmount(els.recurringAmountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    els.recurringAmountInput.focus();
    return;
  }

  const now = new Date().toISOString();
  const id = els.recurringIdInput.value || crypto.randomUUID();
  const item = {
    id,
    name: els.recurringNameInput.value.trim(),
    amount,
    flow: els.recurringFlowSelect.value,
    frequency: els.recurringFrequencySelect.value,
    nextDueDate: els.recurringDueDateInput.value,
    category: els.recurringCategorySelect.value,
    subcategory: els.recurringSubcategorySelect.value,
    createdAt: recurringItems.find((current) => current.id === id)?.createdAt || now,
    updatedAt: now,
  };

  if (!item.name || !item.nextDueDate) return;

  recurringItems = recurringItems.some((current) => current.id === id)
    ? recurringItems.map((current) => (current.id === id ? item : current))
    : [...recurringItems, item];
  saveRecurringItems();
  closeRecurringModal();
  renderUpcoming();
}

function removeRecurringItem(id) {
  recurringItems = recurringItems.filter((item) => item.id !== id);
  saveRecurringItems();
  deleteSupabaseRecurringItem(id);
  renderUpcoming();
}

function renderUpcoming() {
  if (!financeData || !els.upcomingOccurrenceList) return;

  const today = startOfDay(new Date());
  const forecast = getForecastRange(els.forecastHorizonSelect.value, today);
  const occurrences = forecast.mode === "all-bills"
    ? getAllBillOccurrences()
    : getRecurringOccurrences(forecast.start, forecast.end);
  const moneyInItems = occurrences.filter((item) => item.flow === "income");
  const moneyOutItems = occurrences.filter((item) => item.flow === "expense");
  const savedItems = occurrences.filter((item) => item.flow === "saving");
  const moneyIn = sumOccurrenceAmounts(moneyInItems);
  const moneyOut = sumOccurrenceAmounts(moneyOutItems);
  const saved = sumOccurrenceAmounts(savedItems);
  const balance = moneyIn - moneyOut - saved;

  els.forecastMoneyIn.textContent = money(moneyIn);
  els.forecastMoneyInLabel.textContent = moneyInItems.length
    ? `${moneyInItems.length} expected ${moneyInItems.length === 1 ? "payment" : "payments"}`
    : "No upcoming income";
  els.forecastMoneyOut.textContent = money(moneyOut);
  els.forecastMoneyOutLabel.textContent = moneyOutItems.length
    ? `${moneyOutItems.length} expected ${moneyOutItems.length === 1 ? "bill" : "bills"}`
    : "No upcoming bills";
  els.forecastSaved.textContent = money(saved);
  els.forecastSavedLabel.textContent = savedItems.length
    ? `${savedItems.length} expected ${savedItems.length === 1 ? "transfer" : "transfers"}`
    : "No upcoming savings";
  els.forecastBalance.textContent = money(balance);
  els.forecastBalanceCard.classList.toggle("is-good", balance >= 0);
  els.forecastBalanceCard.classList.toggle("is-over", balance < 0);
  els.forecastBalanceLabel.textContent =
    balance >= 0 ? `${money(balance)} forecast surplus` : `${money(Math.abs(balance))} forecast deficit`;

  renderUpcomingOccurrences(occurrences);
  renderRecurringItems();
}

function getForecastRange(value, today = startOfDay(new Date())) {
  if (value === "next-7") return { mode: value, start: today, end: addDays(today, 8) };
  if (value === "next-14") return { mode: value, start: today, end: addDays(today, 15) };
  if (value === "next-30") return { mode: value, start: today, end: addDays(today, 31) };
  if (value === "this-month") {
    return {
      mode: value,
      start: monthStart(dateKey(today).slice(0, 7)),
      end: addMonths(monthStart(dateKey(today).slice(0, 7)), 1),
    };
  }
  if (value === "next-month") {
    const nextMonthStart = addMonths(monthStart(dateKey(today).slice(0, 7)), 1);
    return { mode: value, start: nextMonthStart, end: addMonths(nextMonthStart, 1) };
  }
  if (value === "this-pay-cycle") {
    const start = getPayCycleStartForDate(today);
    return { mode: value, start, end: addMonths(start, 1) };
  }
  if (value === "next-pay-cycle") {
    const start = addMonths(getPayCycleStartForDate(today), 1);
    return { mode: value, start, end: addMonths(start, 1) };
  }
  return { mode: "all-bills", start: today, end: null };
}

function getPayCycleStartForDate(date) {
  const currentMonthStart = monthStart(dateKey(date).slice(0, 7));
  const candidate = parseDate(`${dateKey(currentMonthStart).slice(0, 7)}-${String(PAY_CYCLE_START_DAY).padStart(2, "0")}`);
  return date >= candidate ? candidate : addMonths(candidate, -1);
}

function renderUpcomingOccurrences(occurrences) {
  els.upcomingOccurrenceList.replaceChildren();
  els.occurrenceCountBadge.textContent = `${occurrences.length} ${occurrences.length === 1 ? "item" : "items"}`;

  if (!occurrences.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "No recurring items are due in this forecast window yet.";
    els.upcomingOccurrenceList.append(empty);
    return;
  }

  const groups = new Map();
  occurrences.forEach((occurrence) => {
    const key = occurrence.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(occurrence);
  });

  groups.forEach((items, date) => {
    const group = document.createElement("div");
    group.className = "occurrence-group";
    const label = document.createElement("p");
    label.className = "occurrence-date";
    label.textContent = formatDisplayDate(date);
    group.append(label);

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = `occurrence-row is-${item.flow}`;
      row.innerHTML = `
        <span class="occurrence-marker" aria-hidden="true"></span>
        <span class="occurrence-copy">
          <b>${escapeHtml(item.name)}</b>
          <small>${RECURRING_FLOWS[item.flow]} · ${item.category} · ${item.subcategory} · ${RECURRENCE_FREQUENCIES[item.frequency]?.label || item.frequency}</small>
        </span>
        <strong class="occurrence-amount">${money(item.amount)}</strong>
      `;
      group.append(row);
    });

    els.upcomingOccurrenceList.append(group);
  });
}

function renderRecurringItems() {
  els.recurringScheduleList.replaceChildren();
  const sortedItems = recurringItems.slice().sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  els.recurringCountBadge.textContent = `${sortedItems.length} active`;

  if (!sortedItems.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "Create a recurring item to forecast bills, income, or savings.";
    els.recurringScheduleList.append(empty);
    return;
  }

  sortedItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "recurring-row";
    row.innerHTML = `
      <span class="recurring-copy">
        <b>${escapeHtml(item.name)}</b>
        <small>${money(item.amount)} · ${RECURRING_FLOWS[item.flow]} · ${RECURRENCE_FREQUENCIES[item.frequency]?.label || item.frequency}</small>
        <small>Next due ${formatDisplayDate(item.nextDueDate)} · ${item.category} · ${item.subcategory}</small>
      </span>
      <button type="button" data-edit-recurring="${item.id}">Edit</button>
      <button type="button" data-delete-recurring="${item.id}">Delete</button>
    `;
    row.querySelector("[data-edit-recurring]").addEventListener("click", () => openRecurringModal(item));
    row.querySelector("[data-delete-recurring]").addEventListener("click", () => removeRecurringItem(item.id));
    els.recurringScheduleList.append(row);
  });
}

function getRecurringOccurrences(start, end) {
  return recurringItems
    .flatMap((item) => expandRecurringItem(item, start, end))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

function getAllBillOccurrences() {
  return recurringItems
    .filter((item) => item.flow === "expense")
    .map((item) => ({ ...item, date: item.nextDueDate }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

function expandRecurringItem(item, start, end) {
  const occurrences = [];
  let dueDate = parseDate(item.nextDueDate);
  let guard = 0;

  while (dueDate < start && guard < 400) {
    dueDate = getNextRecurringDate(dueDate, item.frequency);
    guard += 1;
  }

  while (dueDate < end && guard < 800) {
    occurrences.push({ ...item, date: dateKey(dueDate) });
    dueDate = getNextRecurringDate(dueDate, item.frequency);
    guard += 1;
  }

  return occurrences;
}

function getNextRecurringDate(date, frequency) {
  const config = RECURRENCE_FREQUENCIES[frequency] || RECURRENCE_FREQUENCIES.monthly;
  if (config.days) return addDays(date, config.days);
  return addCalendarMonths(date, config.months || 1);
}

function sumOccurrenceAmounts(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function populateCategoryOptions() {
  els.categorySelect.replaceChildren();
  populateEntryTypeSelect(els.entryTypeSelect);
  populateCategorySelect(els.categorySelect);
  populateSubcategoryOptions();
}

function populateEntryTypeSelect(select, selectedValue = "expense") {
  select.replaceChildren();
  Object.entries(ENTRY_TYPES).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    if (value === selectedValue) option.selected = true;
    select.append(option);
  });
}

function populateSubcategoryOptions() {
  els.subcategorySelect.replaceChildren();
  populateSubcategorySelect(els.subcategorySelect, els.categorySelect.value);
  if (periods.length) updateLiveVariance();
}

function populateCategorySelect(select, selectedValue) {
  select.replaceChildren();
  [getSection(INCOME_SECTION), ...getExpenseSections(), getSection(INVESTMENT_SECTION)].forEach((section) => {
    const option = document.createElement("option");
    option.value = section.name;
    option.textContent = section.name;
    select.append(option);
  });
  if (selectedValue) select.value = selectedValue;
}

function populateSubcategorySelect(select, category, selectedValue) {
  const currentSection = getSection(category);
  select.replaceChildren();
  currentSection.rows.forEach((row) => {
    const option = document.createElement("option");
    option.value = row.name;
    option.textContent = row.name;
    select.append(option);
  });
  if (selectedValue) select.value = selectedValue;
}

function populateRecurringCategoryOptions() {
  const category = getRecurringDefaultCategory(els.recurringFlowSelect.value);
  populateCategorySelect(els.recurringCategorySelect, category);
  populateSubcategorySelect(els.recurringSubcategorySelect, category);
}

function syncRecurringFlowDefaults() {
  const category = getRecurringDefaultCategory(els.recurringFlowSelect.value);
  populateCategorySelect(els.recurringCategorySelect, category);
  populateSubcategorySelect(els.recurringSubcategorySelect, category);
}

function getRecurringDefaultCategory(flow) {
  if (flow === "income") return INCOME_SECTION;
  if (flow === "saving") return INVESTMENT_SECTION;
  return EXPENSE_SECTIONS[0];
}

function populatePlanOptions() {
  els.planMonthSelect.replaceChildren();
  els.planSectionSelect.replaceChildren();

  financeData.months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month.key;
    option.textContent = month.label;
    els.planMonthSelect.append(option);
  });

  financeData.sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.name;
    option.textContent = section.name;
    els.planSectionSelect.append(option);
  });
}

function renderPlanEditor() {
  const monthKey = els.planMonthSelect.value;
  const section = getSection(els.planSectionSelect.value);
  els.planEditorList.replaceChildren();

  section.rows.forEach((row) => {
    const baseValue = row.values[monthKey] ?? 0;
    const value = getRowValue(row, section.name, monthKey);
    const hasOverride = hasPlanOverride(section.name, row.name, monthKey);
    const item = document.createElement("label");
    item.className = `plan-row ${hasOverride ? "has-override" : ""}`;
    item.innerHTML = `
      <span>
        <b>${row.name}</b>
        <small>Spreadsheet: ${money(baseValue)}${hasOverride ? " · edited" : ""}</small>
      </span>
      <input type="text" inputmode="decimal" value="${formatPlanInput(value)}" data-row-name="${escapeAttribute(row.name)}" />
    `;
    els.planEditorList.append(item);
  });
}

function savePlanEditor() {
  const monthKey = els.planMonthSelect.value;
  const section = getSection(els.planSectionSelect.value);
  els.planEditorList.querySelectorAll("input[data-row-name]").forEach((input) => {
    const rowName = input.dataset.rowName;
    const row = section.rows.find((item) => item.name === rowName);
    const nextValue = parseAmount(input.value);
    if (!row || !Number.isFinite(nextValue)) return;

    const baseValue = row.values[monthKey] ?? 0;
    const key = getPlanOverrideKey(section.name, rowName, monthKey);
    if (Math.abs(nextValue - baseValue) < 0.005) {
      delete planOverrides[key];
      deleteSupabasePlanOverride(key);
    } else {
      planOverrides[key] = nextValue;
    }
  });
  savePlanOverrides();
  renderPlanEditor();
  render();
}

function resetPlanSection() {
  const monthKey = els.planMonthSelect.value;
  const section = getSection(els.planSectionSelect.value);
  section.rows.forEach((row) => {
    const key = getPlanOverrideKey(section.name, row.name, monthKey);
    delete planOverrides[key];
    deleteSupabasePlanOverride(key);
  });
  savePlanOverrides();
  renderPlanEditor();
  render();
}

function populatePeriodOptions(preferredDateValue = els.entryDateInput.value) {
  const mode = els.periodModeSelect.value;
  periods = buildPeriods(mode);
  els.periodSelect.replaceChildren();
  periods.forEach((period) => {
    const option = document.createElement("option");
    option.value = period.id;
    option.textContent = period.label;
    els.periodSelect.append(option);
  });
  syncPeriodToDateValue(preferredDateValue);
}

function syncDateToPeriod() {
  const period = getSelectedPeriod();
  const today = startOfDay(new Date());
  els.entryDateInput.value = today >= period.start && today < period.end ? dateKey(today) : dateKey(period.start);
  render();
}

function syncPeriodToDate() {
  syncPeriodToDateValue(els.entryDateInput.value);
}

function syncPeriodToDateValue(value) {
  const entryDate = parseDate(els.entryDateInput.value);
  const nextDate = parseDate(value);
  const matchingPeriod = periods.find((period) => entryDate >= period.start && entryDate < period.end);
  const nextMatchingPeriod = periods.find((period) => nextDate >= period.start && nextDate < period.end);
  if (nextMatchingPeriod) {
    els.entryDateInput.value = value;
    els.periodSelect.value = nextMatchingPeriod.id;
  } else if (matchingPeriod) {
    els.periodSelect.value = matchingPeriod.id;
  }
  render();
}

function renderCategories(period, totalTarget) {
  els.categoryList.replaceChildren();
  const periodEntries = getEntriesForPeriod(period);
  const incomeTarget = getBudgetForRange(period.start, period.end, [getSection(INCOME_SECTION)]);

  getExpenseSections().forEach((section) => {
    const target = getBudgetForRange(period.start, period.end, [section]);
    const actual = sumEntryImpacts(
      periodEntries.filter((entry) => entry.category === section.name),
    );
    const share = incomeTarget > 0 ? Math.round((target / incomeTarget) * 100) : 0;
    const pace = getPaceInfo({ actual, target, period, kind: "expense" });

    const row = document.createElement("div");
    row.className = `category-row ${pace.className}`;
    row.innerHTML = `
      <div>
        <div class="category-name">${section.name}</div>
        <small>${share}% of period income · ${money(actual)} actual</small>
        <div class="pace-line">
          <span class="status-pill">${pace.label}</span>
          <span>${money(actual)} of ${money(pace.expected)} expected by now</span>
        </div>
      </div>
      <div class="money">${money(target)}</div>
      <div>
        <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${Math.min(share, 100)}%"></div></div>
        <div class="pace-track" aria-hidden="true"><div class="pace-fill" style="width:${pace.progress}%"></div></div>
      </div>
    `;
    els.categoryList.append(row);
  });

  const savingsSection = getSection(INVESTMENT_SECTION);
  const savingsTarget = getBudgetForRange(period.start, period.end, [savingsSection]);
  const savingsActual = sumEntries(periodEntries.filter((entry) => entry.category === INVESTMENT_SECTION));
  const savingsShare = incomeTarget > 0 ? Math.round((savingsTarget / incomeTarget) * 100) : 0;
  const savingsPace = getPaceInfo({ actual: savingsActual, target: savingsTarget, period, kind: "savings" });
  const savingsRow = document.createElement("div");
  savingsRow.className = `category-row savings-row ${savingsPace.className}`;
  savingsRow.innerHTML = `
    <div>
      <div class="category-name">Savings</div>
      <small>${savingsShare}% of period income · ${money(savingsActual)} actual</small>
      <div class="pace-line">
        <span class="status-pill">${savingsPace.label}</span>
        <span>${money(savingsActual)} of ${money(savingsPace.expected)} expected by now</span>
      </div>
    </div>
    <div class="money">${money(savingsTarget)}</div>
    <div>
      <div class="bar-track" aria-hidden="true"><div class="bar-fill savings-fill" style="width:${Math.min(savingsShare, 100)}%"></div></div>
      <div class="pace-track" aria-hidden="true"><div class="pace-fill" style="width:${savingsPace.progress}%"></div></div>
    </div>
  `;
  els.categoryList.append(savingsRow);
}

function renderEntryReport(period, periodEntries) {
  els.entryReportBadge.textContent = period.shortLabel;
  els.entryReportList.replaceChildren();

  if (!periodEntries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "No entries in this period yet.";
    els.entryReportList.append(empty);
    return;
  }

  const groupedEntries = new Map();
  periodEntries.forEach((entry) => {
    const key = `${entry.category || "Unclassified"}::${entry.subcategory || "No subcategory"}`;
    const current = groupedEntries.get(key) || {
      category: entry.category || "Unclassified",
      subcategory: entry.subcategory || "No subcategory",
      entries: [],
      total: 0,
    };
    current.entries.push(entry);
    current.total += getReportSignedAmount(entry);
    groupedEntries.set(key, current);
  });

  const reportRows = [...groupedEntries.values()];
  const categoryGroups = new Map();
  reportRows.forEach((row) => {
    const group = categoryGroups.get(row.category) || {
      category: row.category,
      entries: [],
      rows: [],
      total: 0,
    };
    group.entries.push(...row.entries);
    group.rows.push(row);
    group.total += row.total;
    categoryGroups.set(row.category, group);
  });

  const allRows = [
    ...reportRows,
    ...categoryGroups.values().map((group) => ({ total: group.total })),
  ];
  const maxValue = Math.max(...allRows.map((row) => Math.abs(row.total)), 1);
  const sortedGroups = [...categoryGroups.values()].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

  sortedGroups.forEach((group) => {
    els.entryReportList.append(
      createReportRow({
        className: "report-group-row",
        label: group.category,
        detail: `${group.rows.length} ${group.rows.length === 1 ? "subcategory" : "subcategories"} · ${group.entries.length} ${group.entries.length === 1 ? "entry" : "entries"}`,
        total: group.total,
        maxValue,
        entries: group.entries,
        category: group.category,
        title: group.category,
      }),
    );

    group.rows
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .forEach((item) => {
        els.entryReportList.append(
          createReportRow({
            label: item.subcategory,
            detail: `${item.category} · ${item.entries.length} ${item.entries.length === 1 ? "entry" : "entries"}`,
            total: item.total,
            maxValue,
            entries: item.entries,
            category: item.category,
            subcategory: item.subcategory,
            title: item.subcategory,
          }),
        );
      });
  });
}

function createReportRow({ className = "", label, detail, total, maxValue, category, subcategory = "", title }) {
  const row = document.createElement("button");
  row.className = `report-row ${className} ${total < 0 ? "is-negative" : "is-positive"}`;
  row.type = "button";
  row.innerHTML = `
    <span class="report-icon">${getReportInitials(label)}</span>
    <span class="report-copy">
      <b>${label}</b>
      <small>${detail}</small>
    </span>
    <span class="report-money">${formatReportMoney(total)}</span>
    <span class="report-bar" aria-hidden="true">
      <span style="width:${(Math.abs(total) / maxValue) * 100}%"></span>
    </span>
  `;
  row.addEventListener("click", () =>
    openReportEntries({
      title,
      category,
      subcategory,
    }),
  );
  return row;
}

function openReportEntries(group) {
  renderEntryList(createReportEntryContext(group));
  els.entryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closeEntriesButton.focus();
}

function getReportSignedAmount(entry) {
  const amount = Number(entry.amount || 0);
  return isExpenseCategory(entry.category) ? -getEntryImpact(entry) : amount;
}

function formatReportMoney(value) {
  return value < 0 ? `-${money(Math.abs(value))}` : money(value);
}

function getReportInitials(value) {
  const words = String(value || "?")
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "?";
}

function renderTrend(period) {
  const values = financeData.months.map((month) => {
    const start = monthStart(month.key);
    const end = addMonths(start, 1);
    return {
      ...month,
      total: getBudgetForRange(start, end, getExpenseSections()),
    };
  });
  const max = Math.max(...values.map((item) => item.total), 1);

  els.trendChart.replaceChildren();
  values.forEach((item) => {
    const isSelected = period.start < addMonths(monthStart(item.key), 1) && period.end > monthStart(item.key);
    const row = document.createElement("div");
    row.className = `trend-row ${isSelected ? "is-selected" : ""}`;
    row.innerHTML = `
      <span>${item.label.replace(" ", " '")}</span>
      <div class="trend-bar-track"><div class="trend-bar" style="width:${(item.total / max) * 100}%"></div></div>
      <strong>${money(item.total)}</strong>
    `;
    els.trendChart.append(row);
  });
}

function renderMiniTable(period) {
  const periodEntries = getEntriesForPeriod(period);
  const incomeEntries = periodEntries.filter((entry) => entry.category === INCOME_SECTION);
  els.incomeValue.textContent = money(
    incomeEntries.length ? sumEntries(incomeEntries) : getBudgetForRange(period.start, period.end, [getSection(INCOME_SECTION)]),
  );
  els.expensesValue.textContent = money(getBudgetForRange(period.start, period.end, getExpenseSections()));
  els.savingsValue.textContent = money(getBudgetForRange(period.start, period.end, [getSection(INVESTMENT_SECTION)]));
}

function renderInvestments(period, periodEntries) {
  const investmentSection = getSection(INVESTMENT_SECTION);
  const plannedInvestment = getBudgetForRange(period.start, period.end, [investmentSection]);
  const actualInvestment = sumEntries(periodEntries.filter((entry) => entry.category === INVESTMENT_SECTION));
  const accumulatedBudget = getBudgetForRange(monthStart(financeData.months[0].key), period.end, [investmentSection]);
  const compoundValue = getCompoundInvestmentValue(period.end, investmentSection);

  els.investmentBadge.textContent = period.shortLabel;
  els.monthlyInvestment.textContent = money(plannedInvestment);
  els.accumulatedInvestment.textContent = money(accumulatedBudget);
  els.compoundInvestment.textContent = money(compoundValue);

  const groupedRows = getInvestmentGroups(investmentSection).map((group) => {
    const plannedValue = group.rows.reduce(
      (sum, row) => sum + getRowBudgetForRange(row, period.start, period.end),
      0,
    );
    const actualValue = sumEntries(
      periodEntries.filter((entry) => entry.category === INVESTMENT_SECTION && group.names.includes(entry.subcategory)),
    );
    return { ...group, plannedValue, actualValue };
  });
  els.investmentRows.replaceChildren();

  groupedRows.forEach((item) => {
    const row = document.createElement("div");
    row.className = "investment-row";
    const progress = item.plannedValue > 0 ? Math.min((item.actualValue / item.plannedValue) * 100, 100) : item.actualValue > 0 ? 100 : 0;
    row.innerHTML = `
      <div>
        <div class="category-name">${item.label}</div>
        <small>${money(item.actualValue)} actual of ${money(item.plannedValue)} planned</small>
      </div>
      <div class="investment-money">
        <span>Planned ${money(item.plannedValue)}</span>
        <strong>${money(item.actualValue)}</strong>
      </div>
      <div class="investment-progress" aria-label="${item.label}: ${money(item.actualValue)} actual of ${money(item.plannedValue)} planned">
        <div class="investment-planned-line"></div>
        <div class="investment-actual-line" style="width:${progress}%"></div>
      </div>
    `;
    els.investmentRows.append(row);
  });

  const actualRow = document.createElement("div");
  actualRow.className = "investment-row compound-row";
  actualRow.innerHTML = `
    <div>
      <div class="category-name">Actual investment entries</div>
      <small>Saved from entries dated inside this period</small>
    </div>
    <div class="money">${money(actualInvestment)}</div>
    <div class="bar-track" aria-hidden="true"><div class="bar-fill compound-fill" style="width:100%"></div></div>
  `;
  els.investmentRows.prepend(actualRow);
}

function getInvestmentGroups(investmentSection) {
  const groupConfig = [
    { label: "Main Saving (Fire Extinguisher)", names: ["Main Saving (Fire extinguisher)"] },
    { label: "Investment USA", names: ["eToro Alex", "Stake Alex", "eToro Dai / IBKR"] },
    { label: "Investment AUS", names: ["Vanguard"] },
    { label: "Salary Sacrifice", names: ["Salary Sacrifice"] },
  ];
  return groupConfig.map((group) => ({
    ...group,
    rows: group.names.map((name) => investmentSection.rows.find((row) => row.name === name)).filter(Boolean),
  }));
}

function buildPeriods(mode) {
  const firstYear = Number(financeData.months[0].key.slice(0, 4));
  if (mode === "month") {
    return financeData.months.map((month) => ({
      id: month.key,
      mode,
      label: month.label,
      shortLabel: month.label,
      start: monthStart(month.key),
      end: addMonths(monthStart(month.key), 1),
    }));
  }
  if (mode === "payCycle") {
    return financeData.months.map((month) => {
      const start = parseDate(`${month.key}-${String(PAY_CYCLE_START_DAY).padStart(2, "0")}`);
      const end = addMonths(start, 1);
      return {
        id: `pay-${month.key}`,
        mode,
        label: `${formatShortDate(start)} - ${formatShortDate(addDays(end, -1))}`,
        shortLabel: `Pay cycle ${formatShortDate(start)}`,
        start,
        end,
      };
    });
  }
  const weeks = [];
  let start = startOfISOWeek(parseDate(`${firstYear}-01-01`));
  let weekNumber = 1;
  const yearEnd = parseDate(`${firstYear + 1}-01-01`);
  while (start < yearEnd) {
    const end = addDays(start, 7);
    if (end > parseDate(`${firstYear}-01-01`) && start < yearEnd) {
      weeks.push({
        id: `week-${firstYear}-${String(weekNumber).padStart(2, "0")}`,
        mode,
        label: `${firstYear} W${String(weekNumber).padStart(2, "0")} · ${formatShortDate(start)} - ${formatShortDate(addDays(end, -1))}`,
        shortLabel: `${firstYear} W${String(weekNumber).padStart(2, "0")}`,
        start,
        end,
      });
      weekNumber += 1;
    }
    start = end;
  }
  return weeks;
}

function getBudgetForRange(start, end, sections) {
  return sections.reduce((total, section) => {
    return total + financeData.months.reduce((sum, month) => {
      const monthStartDate = monthStart(month.key);
      const monthEndDate = addMonths(monthStartDate, 1);
      const overlapDays = getOverlapDays(start, end, monthStartDate, monthEndDate);
      if (!overlapDays) return sum;
      return sum + getSectionTotalValue(section, month.key) * (overlapDays / getDaysBetween(monthStartDate, monthEndDate));
    }, 0);
  }, 0);
}

function getRowBudgetForRange(row, start, end) {
  return financeData.months.reduce((sum, month) => {
    const monthStartDate = monthStart(month.key);
    const monthEndDate = addMonths(monthStartDate, 1);
    const overlapDays = getOverlapDays(start, end, monthStartDate, monthEndDate);
    if (!overlapDays) return sum;
    return sum + getRowValue(row, getSectionNameForRow(row), month.key) * (overlapDays / getDaysBetween(monthStartDate, monthEndDate));
  }, 0);
}

function getCompoundInvestmentValue(endDate, investmentSection) {
  const monthlyRate = Math.pow(1 + ANNUAL_RETURN_RATE, 1 / 12) - 1;
  return financeData.months.reduce((balance, month) => {
    const contributionDate = addMonths(monthStart(month.key), 1);
    if (contributionDate > endDate) return balance;
    return (balance + getSectionTotalValue(investmentSection, month.key)) * (1 + monthlyRate);
  }, 0);
}

function getSectionTotalValue(section, monthKey) {
  const overrideDelta = section.rows.reduce((sum, row) => {
    const baseValue = row.values[monthKey] ?? 0;
    return sum + (getRowValue(row, section.name, monthKey) - baseValue);
  }, 0);
  return (section.totals[monthKey] ?? 0) + overrideDelta;
}

function getRowValue(row, sectionName, monthKey) {
  const key = getPlanOverrideKey(sectionName, row.name, monthKey);
  return Object.prototype.hasOwnProperty.call(planOverrides, key) ? Number(planOverrides[key]) : (row.values[monthKey] ?? 0);
}

function getSectionNameForRow(row) {
  return financeData.sections.find((section) => section.rows.includes(row))?.name;
}

function getPlanOverrideKey(sectionName, rowName, monthKey) {
  return `${sectionName}::${rowName}::${monthKey}`;
}

function hasPlanOverride(sectionName, rowName, monthKey) {
  return Object.prototype.hasOwnProperty.call(planOverrides, getPlanOverrideKey(sectionName, rowName, monthKey));
}

function getSelectedPeriod() {
  return periods.find((period) => period.id === els.periodSelect.value) ?? periods[0];
}

function getDefaultEntryDateKey() {
  const today = startOfDay(new Date());
  const isInsidePlanYear = financeData.months.some((month) => {
    const start = monthStart(month.key);
    const end = addMonths(start, 1);
    return today >= start && today < end;
  });

  return isInsidePlanYear ? dateKey(today) : `${financeData.months[0].key}-01`;
}

function getEntriesForPeriod(period) {
  return entries.filter((entry) => {
    const date = parseDate(entry.date);
    return date >= period.start && date < period.end;
  });
}

function getExpenseSections() {
  return financeData.sections.filter((section) => EXPENSE_SECTIONS.includes(section.name));
}

function getSection(name) {
  return financeData.sections.find((section) => section.name === name);
}

function getFirstSubcategory(category) {
  return getSection(category)?.rows[0]?.name || "";
}

function isExpenseCategory(category) {
  return EXPENSE_SECTIONS.includes(category);
}

function getPaceInfo({ actual, target, period, kind }) {
  const today = startOfDay(new Date());
  const periodDays = Math.max(getDaysBetween(period.start, period.end), 1);
  const elapsedDays = Math.min(Math.max(getDaysBetween(period.start, addDays(today, 1)), 0), periodDays);
  const expected = target * (elapsedDays / periodDays);
  const tolerance = Math.max(target * 0.05, 50);
  const delta = actual - expected;
  const isComplete = today >= period.end;
  const progress = expected > 0 ? Math.min(Math.max((actual / expected) * 100, 0), 100) : actual > 0 ? 100 : 0;

  if (Math.abs(delta) <= tolerance) {
    return { expected, progress, label: isComplete ? "Complete" : "On track", className: "pace-good" };
  }

  if (kind === "savings") {
    return delta > 0
      ? { expected, progress, label: "Ahead", className: "pace-good" }
      : { expected, progress, label: "Behind", className: "pace-over" };
  }

  return delta > 0
    ? { expected, progress, label: isComplete ? "Over final" : "Over pace", className: "pace-over" }
    : { expected, progress, label: isComplete ? "Under final" : "Under pace", className: "pace-under" };
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  syncEntriesToSupabase();
}

async function loadPrivateFinanceData() {
  try {
    const { data, error } = await supabase
      .from(PLAN_DATA_TABLE)
      .select("data")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) throw error;
    if (data?.data) {
      setSyncStatus("Private plan loaded", "online");
      return data.data;
    }

    const importedData = await importLocalFinanceData();
    if (importedData) return importedData;

    setSyncStatus("No private plan data found", "warning");
    els.authMessage.textContent = "Signed in, but no private plan data was found in Supabase.";
    return null;
  } catch (error) {
    console.warn("Private plan load failed.", error);
    setSyncStatus("Private plan table not ready", "warning");
    els.authMessage.textContent = "Run the Supabase plan-data setup, then reload after signing in.";
    return null;
  }
}

async function importLocalFinanceData() {
  try {
    const response = await fetch("finance-data.json", { cache: "no-store" });
    if (!response.ok) return null;

    const localData = await response.json();
    const { error } = await supabase.from(PLAN_DATA_TABLE).upsert(
      {
        user_id: currentUser.id,
        data: localData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;

    setSyncStatus("Private plan imported", "online");
    return localData;
  } catch (error) {
    console.warn("Local plan import failed.", error);
    return null;
  }
}

async function hydrateFromSupabase() {
  if (!currentUser) {
    setSyncStatus("Sign in for private cloud sync", "warning");
    return;
  }

  setSyncStatus("Syncing with Supabase...", "warning");
  try {
    const [{ data: remoteEntries, error: entriesError }, { data: remoteOverrides, error: overridesError }] =
      await Promise.all([
        supabase.from(ENTRIES_TABLE).select("*").eq("user_id", currentUser.id),
        supabase.from(PLAN_OVERRIDES_TABLE).select("*").eq("user_id", currentUser.id),
      ]);

    if (entriesError) throw entriesError;
    if (overridesError) throw overridesError;

    entries = mergeEntries(entries, (remoteEntries || []).map(fromSupabaseEntry));
    planOverrides = {
      ...Object.fromEntries((remoteOverrides || []).map((row) => [fromSupabaseKey(row.override_key), Number(row.amount)])),
      ...planOverrides,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planOverrides));
    await Promise.all([pushEntriesToSupabase(), pushPlanOverridesToSupabase()]);
    await hydrateRecurringItemsFromSupabase();
    setSyncStatus("Supabase sync on", "online");
  } catch (error) {
    console.warn("Supabase sync is not ready yet.", error);
    setSyncStatus("Local backup only - run Supabase setup", "warning");
  }
}

function mergeEntries(localEntries, remoteEntries) {
  const merged = new Map();
  remoteEntries.forEach((entry) => merged.set(entry.id, entry));
  localEntries.forEach((entry) => merged.set(entry.id, entry));
  return [...merged.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function syncEntriesToSupabase() {
  pushEntriesToSupabase().catch((error) => {
    console.warn("Entry sync failed.", error);
    setSyncStatus("Local backup only - Supabase not ready", "warning");
  });
}

async function pushEntriesToSupabase() {
  if (!currentUser) return;
  if (!entries.length) return;
  const { error } = await supabase
    .from(ENTRIES_TABLE)
    .upsert(entries.map(toSupabaseEntry), { onConflict: "id" });
  if (error) throw error;
  setSyncStatus("Supabase sync on", "online");
}

async function deleteSupabaseEntry(id) {
  if (!currentUser) return;
  const { error } = await supabase
    .from(ENTRIES_TABLE)
    .delete()
    .eq("id", toSupabaseKey(id))
    .eq("user_id", currentUser.id);
  if (error) {
    console.warn("Entry delete sync failed.", error);
    setSyncStatus("Local backup only - Supabase not ready", "warning");
    return;
  }
  setSyncStatus("Supabase sync on", "online");
}

function toSupabaseEntry(entry) {
  return {
    id: toSupabaseKey(entry.id),
    user_id: currentUser.id,
    amount: Number(entry.amount || 0),
    entry_type: getEntryType(entry),
    entry_date: entry.date,
    category: entry.category,
    subcategory: entry.subcategory || null,
    source: entry.source || null,
    created_at: entry.createdAt || new Date().toISOString(),
    updated_at: entry.updatedAt || entry.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseEntry(row) {
  return {
    id: fromSupabaseKey(row.id),
    amount: Number(row.amount || 0),
    type: row.entry_type || "expense",
    date: row.entry_date,
    category: row.category,
    subcategory: row.subcategory || "",
    source: row.source || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function hydrateRecurringItemsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from(RECURRING_TABLE)
      .select("*")
      .eq("user_id", currentUser.id);
    if (error) throw error;

    recurringItems = mergeRecurringItems(recurringItems, (data || []).map(fromSupabaseRecurringItem));
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringItems));
    await pushRecurringItemsToSupabase();
  } catch (error) {
    console.warn("Recurring item sync is not ready yet.", error);
  }
}

function mergeRecurringItems(localItems, remoteItems) {
  const merged = new Map();
  remoteItems.forEach((item) => merged.set(item.id, item));
  localItems.forEach((item) => merged.set(item.id, item));
  return [...merged.values()].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
}

function saveRecurringItems() {
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringItems));
  pushRecurringItemsToSupabase().catch((error) => {
    console.warn("Recurring item sync failed.", error);
    setSyncStatus("Recurring items saved locally - run Supabase setup", "warning");
  });
}

async function pushRecurringItemsToSupabase() {
  if (!currentUser || !recurringItems.length) return;
  const { error } = await supabase
    .from(RECURRING_TABLE)
    .upsert(recurringItems.map(toSupabaseRecurringItem), { onConflict: "id" });
  if (error) throw error;
  setSyncStatus("Supabase sync on", "online");
}

async function deleteSupabaseRecurringItem(id) {
  if (!currentUser) return;
  const { error } = await supabase
    .from(RECURRING_TABLE)
    .delete()
    .eq("id", toSupabaseKey(id))
    .eq("user_id", currentUser.id);
  if (error) {
    console.warn("Recurring item delete sync failed.", error);
    setSyncStatus("Recurring item deleted locally - run Supabase setup", "warning");
    return;
  }
  setSyncStatus("Supabase sync on", "online");
}

function toSupabaseRecurringItem(item) {
  return {
    id: toSupabaseKey(item.id),
    user_id: currentUser.id,
    name: item.name,
    amount: Number(item.amount || 0),
    flow: item.flow,
    frequency: item.frequency,
    next_due_date: item.nextDueDate,
    category: item.category,
    subcategory: item.subcategory || null,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseRecurringItem(row) {
  return {
    id: fromSupabaseKey(row.id),
    name: row.name,
    amount: Number(row.amount || 0),
    flow: row.flow,
    frequency: row.frequency,
    nextDueDate: row.next_due_date,
    category: row.category,
    subcategory: row.subcategory || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function seedHistoricalActualEntries() {
  if (localStorage.getItem(HISTORICAL_SEED_KEY) === "done") return;

  const historicalStart = parseDate(`${HISTORICAL_ACTUAL_MONTHS[0]}-01`);
  const historicalEnd = addMonths(monthStart(HISTORICAL_ACTUAL_MONTHS.at(-1)), 1);
  entries = entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return entryDate < historicalStart || entryDate >= historicalEnd;
  });

  financeData.sections.forEach((section) => {
    section.rows.forEach((row) => {
      HISTORICAL_ACTUAL_MONTHS.forEach((monthKey) => {
        const amount = getRowValue(row, section.name, monthKey);
        if (!amount) return;
        entries.push({
          id: `historical-${monthKey}-${section.name}-${row.name}`,
          amount,
          date: `${monthKey}-15`,
          category: section.name,
          subcategory: row.name,
          createdAt: new Date().toISOString(),
          source: "historical-spreadsheet-actual",
        });
      });
    });
  });

  saveEntries();
  localStorage.setItem(HISTORICAL_SEED_KEY, "done");
}

function savePlanOverrides() {
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planOverrides));
  syncPlanOverridesToSupabase();
}

function syncPlanOverridesToSupabase() {
  pushPlanOverridesToSupabase().catch((error) => {
    console.warn("Plan override sync failed.", error);
    setSyncStatus("Local backup only - Supabase not ready", "warning");
  });
}

async function pushPlanOverridesToSupabase() {
  if (!currentUser) return;
  const payload = Object.entries(planOverrides).map(([key, amount]) => {
    const [sectionName, rowName, monthKey] = key.split("::");
    return {
      override_key: toSupabaseKey(key),
      user_id: currentUser.id,
      section_name: sectionName,
      row_name: rowName,
      month_key: monthKey,
      amount: Number(amount || 0),
      updated_at: new Date().toISOString(),
    };
  });
  if (!payload.length) return;

  const { error } = await supabase
    .from(PLAN_OVERRIDES_TABLE)
    .upsert(payload, { onConflict: "override_key" });
  if (error) throw error;
  setSyncStatus("Supabase sync on", "online");
}

async function deleteSupabasePlanOverride(key) {
  if (!currentUser) return;
  const { error } = await supabase
    .from(PLAN_OVERRIDES_TABLE)
    .delete()
    .eq("override_key", toSupabaseKey(key))
    .eq("user_id", currentUser.id);
  if (error) {
    console.warn("Plan override delete sync failed.", error);
    setSyncStatus("Local backup only - Supabase not ready", "warning");
    return;
  }
  setSyncStatus("Supabase sync on", "online");
}

function setSyncStatus(message, state = "") {
  els.syncStatus.textContent = message;
  els.syncStatus.classList.toggle("is-online", state === "online");
  els.syncStatus.classList.toggle("is-warning", state === "warning");
}

function toSupabaseKey(id) {
  return `${currentUser.id}:${id}`;
}

function fromSupabaseKey(id) {
  const prefix = `${currentUser?.id}:`;
  return String(id).startsWith(prefix) ? String(id).slice(prefix.length) : id;
}

function loadPlanOverrides() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadRecurringItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECURRING_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function loadEntries() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return [];
  try {
    const legacyEntries = JSON.parse(legacy);
    return Object.entries(legacyEntries).flatMap(([key, value]) => {
      const [monthKey, weekPart] = key.split(":week-");
      const week = Number(weekPart || 1);
      const entryDate = dateKey(addDays(monthStart(monthKey), (week - 1) * 7));
      const values = Array.isArray(value) ? value : [{ amount: value }];
      return values.map((entry) => ({
        id: crypto.randomUUID(),
        amount: Number(entry.amount ?? entry),
        date: entry.date || entryDate,
        category: entry.category || "Daily Expenses",
        subcategory: entry.subcategory || "Others",
        createdAt: entry.createdAt || null,
      }));
    });
  } catch {
    return [];
  }
}

function parseAmount(value) {
  return Number(String(value).replace(/,/g, "").trim());
}

function formatPlanInput(value) {
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sumEntries(items) {
  return items.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

function sumEntryImpacts(items) {
  return items.reduce((sum, entry) => sum + getEntryImpact(entry), 0);
}

function getEntryImpact(entry) {
  const amount = Number(entry?.amount || 0);
  if (!isExpenseCategory(entry?.category)) return amount;
  return getEntryType(entry) === "expense" ? amount : -amount;
}

function isMoneyInEntry(entry) {
  return entry.category === INCOME_SECTION || (isExpenseCategory(entry.category) && getEntryType(entry) !== "expense");
}

function getEntryType(entry) {
  return entry?.type && Object.prototype.hasOwnProperty.call(ENTRY_TYPES, entry.type) ? entry.type : "expense";
}

function getEntryTypeLabel(entry) {
  return ENTRY_TYPES[getEntryType(entry)];
}

function formatEntryAmount(entry) {
  const amount = Number(entry.amount || 0);
  return getEntryImpact(entry) < 0 ? `+${money(amount)}` : money(amount);
}

function money(value) {
  return formatter.format(value || 0);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthStart(monthKey) {
  return parseDate(`${monthKey}-01`);
}

function getMonthKeyForDate(date) {
  return financeData.months.find((month) => {
    const start = monthStart(month.key);
    const end = addMonths(start, 1);
    return date >= start && date < end;
  })?.key;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date, months) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function addCalendarMonths(date, months) {
  const day = date.getDate();
  const copy = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(copy.getFullYear(), copy.getMonth() + 1, 0).getDate();
  copy.setDate(Math.min(day, lastDay));
  return copy;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfISOWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  return addDays(copy, 1 - day);
}

function getOverlapDays(startA, endA, startB, endB) {
  const start = Math.max(startA.getTime(), startB.getTime());
  const end = Math.min(endA.getTime(), endB.getTime());
  return Math.max(0, Math.round((end - start) / 86400000));
}

function getDaysBetween(start, end) {
  return Math.round((end - start) / 86400000);
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatDisplayDate(value) {
  return parseDate(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
