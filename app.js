import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const EXPENSE_SECTIONS = ["Daily Expenses", "Financial Obligations", "Splurge", "Smile"];
const INCOME_SECTION = "Income";
const INVESTMENT_SECTION = "Investments / Savings";
const ENTRY_TYPES = {
  expense: "Expense",
  credit: "Refund/Credit",
  reserve: "Reserve used",
};
const INVESTMENT_SUBCATEGORY_RENAMES = new Map([
  ["Main Saving (Fire extinguisher)", "Fire extinguisher (Saving)"],
  ["Main Saving (Fire Extinguisher)", "Fire extinguisher (Saving)"],
  ["eToro Dai / IBKR", "IBKR"],
]);
const INVESTMENT_EXTRA_SUBCATEGORIES = ["Smile (Saving)"];
const SPLURGE_EXTRA_SUBCATEGORIES = ["Splurge Dai", "Splurge Miguel", "Splurge Alex"];
const ANNUAL_RETURN_RATE = 0.1;
const PAY_CYCLE_START_DAY = 14;
const SUPABASE_URL = "https://cqbtorlmiqdpcoxqnrjy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYnRvcmxtaXFkcGNveHFucmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjM4NTIsImV4cCI6MjA5NDI5OTg1Mn0.2zZTXBFND6bXTksO6M8KmM0SlKBl8N9cD_mtKaajW6c";
const ENTRIES_TABLE = "finance_entries";
const PLAN_OVERRIDES_TABLE = "finance_plan_overrides";
const PLAN_DATA_TABLE = "finance_plan_data";
const RECURRING_TABLE = "finance_recurring_items";
const RECURRING_STATUS_TABLE = "finance_recurring_occurrence_status";
const NET_WORTH_TABLE = "finance_net_worth_items";
const STORAGE_KEY = "finance-tracker-dated-entries:v2";
const RECURRING_STORAGE_KEY = "finance-tracker-recurring-items:v1";
const RECURRING_STATUS_STORAGE_KEY = "finance-tracker-recurring-status:v1";
const NET_WORTH_STORAGE_KEY = "finance-tracker-net-worth-items:v1";
const LEGACY_STORAGE_KEY = "weekly-finance-tracker:v1";
const PLAN_STORAGE_KEY = "finance-tracker-plan-overrides:v2";
const HISTORICAL_SEED_KEY = "finance-tracker-historical-actuals:v2";
const SYNC_STATE_STORAGE_KEY = "finance-tracker-sync-state:v1";
const PLAN_DIRTY_STORAGE_KEY = "finance-tracker-plan-dirty-at:v1";
const HISTORICAL_ACTUAL_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"];
const IMPORT_SOURCE_PREFIX = "csv-import:";
const RECURRENCE_FREQUENCIES = {
  once: { label: "One-time" },
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
const NET_WORTH_TAXONOMY = {
  asset: {
    "Accounts & funds": ["Investment saving", "Managed funds", "Pension account", "Savings account", "Term deposit"],
    Property: ["Residential", "Commercial", "Industrial", "Rural"],
    Vehicles: ["Car", "Bike", "Boat"],
    "Other assets": ["Business equity", "Cash", "Collections", "Home content", "Life insurance", "Shares", "Stock & machinery", "Tools of trade"],
  },
  liability: {
    "Business debt": ["Business loan", "Commercial bill", "Term loan", "Margin loan"],
    "Personal credit": ["Credit card", "Store card", "Personal loan", "Line of credit", "Overdraft"],
    "Asset-backed debt": ["Hire purchase", "Lease"],
    "Government & contingent": ["HECS", "Tax debt", "Contingent liability"],
  },
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
  netWorthView: document.querySelector("#netWorthView"),
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
  overduePanel: document.querySelector("#overduePanel"),
  overdueCountBadge: document.querySelector("#overdueCountBadge"),
  overdueOccurrenceList: document.querySelector("#overdueOccurrenceList"),
  completedPanel: document.querySelector("#completedPanel"),
  completedCountBadge: document.querySelector("#completedCountBadge"),
  completedOccurrenceList: document.querySelector("#completedOccurrenceList"),
  recurringCountBadge: document.querySelector("#recurringCountBadge"),
  recurringScheduleList: document.querySelector("#recurringScheduleList"),
  addNetWorthButton: document.querySelector("#addNetWorthButton"),
  netWorthBalanceCard: document.querySelector("#netWorthBalanceCard"),
  netWorthBalance: document.querySelector("#netWorthBalance"),
  totalAssetsValue: document.querySelector("#totalAssetsValue"),
  totalAssetsLabel: document.querySelector("#totalAssetsLabel"),
  totalLiabilitiesValue: document.querySelector("#totalLiabilitiesValue"),
  totalLiabilitiesLabel: document.querySelector("#totalLiabilitiesLabel"),
  linkedAccountValue: document.querySelector("#linkedAccountValue"),
  assetCountBadge: document.querySelector("#assetCountBadge"),
  liabilityCountBadge: document.querySelector("#liabilityCountBadge"),
  assetList: document.querySelector("#assetList"),
  liabilityList: document.querySelector("#liabilityList"),
  periodModeSelect: document.querySelector("#periodModeSelect"),
  periodSelect: document.querySelector("#periodSelect"),
  entryDateInput: document.querySelector("#entryDateInput"),
  actualInput: document.querySelector("#actualInput"),
  entryDescriptionInput: document.querySelector("#entryDescriptionInput"),
  entryTypeSelect: document.querySelector("#entryTypeSelect"),
  categorySelect: document.querySelector("#categorySelect"),
  subcategorySelect: document.querySelector("#subcategorySelect"),
  accountSelect: document.querySelector("#accountSelect"),
  saveButton: document.querySelector("#saveButton"),
  viewEntriesButton: document.querySelector("#viewEntriesButton"),
  bulkEntriesButton: document.querySelector("#bulkEntriesButton"),
  importCsvButton: document.querySelector("#importCsvButton"),
  editPlanButton: document.querySelector("#editPlanButton"),
  closeEntriesButton: document.querySelector("#closeEntriesButton"),
  closeBulkButton: document.querySelector("#closeBulkButton"),
  closeImportButton: document.querySelector("#closeImportButton"),
  entryModal: document.querySelector("#entryModal"),
  entryModalTitle: document.querySelector("#entryModalTitle"),
  entryModalSummary: document.querySelector("#entryModalSummary"),
  bulkModal: document.querySelector("#bulkModal"),
  bulkModalSummary: document.querySelector("#bulkModalSummary"),
  bulkEntryRows: document.querySelector("#bulkEntryRows"),
  addBulkRowButton: document.querySelector("#addBulkRowButton"),
  saveBulkButton: document.querySelector("#saveBulkButton"),
  importModal: document.querySelector("#importModal"),
  csvFileInput: document.querySelector("#csvFileInput"),
  importModalSummary: document.querySelector("#importModalSummary"),
  importRows: document.querySelector("#importRows"),
  clearImportButton: document.querySelector("#clearImportButton"),
  saveImportButton: document.querySelector("#saveImportButton"),
  planModal: document.querySelector("#planModal"),
  closePlanButton: document.querySelector("#closePlanButton"),
  planPeriodModeSelect: document.querySelector("#planPeriodModeSelect"),
  planMonthSelect: document.querySelector("#planMonthSelect"),
  planSectionSelect: document.querySelector("#planSectionSelect"),
  planOverviewSummary: document.querySelector("#planOverviewSummary"),
  planOverviewMessage: document.querySelector("#planOverviewMessage"),
  planEditorSummary: document.querySelector("#planEditorSummary"),
  planEditorList: document.querySelector("#planEditorList"),
  planEditActions: document.querySelector("#planEditActions"),
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
  recurringEndDateInput: document.querySelector("#recurringEndDateInput"),
  recurringOccurrenceLimitInput: document.querySelector("#recurringOccurrenceLimitInput"),
  recurringCategorySelect: document.querySelector("#recurringCategorySelect"),
  recurringSubcategorySelect: document.querySelector("#recurringSubcategorySelect"),
  closeRecurringButton: document.querySelector("#closeRecurringButton"),
  cancelRecurringButton: document.querySelector("#cancelRecurringButton"),
  netWorthModal: document.querySelector("#netWorthModal"),
  netWorthForm: document.querySelector("#netWorthForm"),
  netWorthModalTitle: document.querySelector("#netWorthModalTitle"),
  netWorthIdInput: document.querySelector("#netWorthIdInput"),
  netWorthKindSelect: document.querySelector("#netWorthKindSelect"),
  netWorthGroupSelect: document.querySelector("#netWorthGroupSelect"),
  netWorthSubtypeSelect: document.querySelector("#netWorthSubtypeSelect"),
  netWorthNameInput: document.querySelector("#netWorthNameInput"),
  netWorthValueInput: document.querySelector("#netWorthValueInput"),
  closeNetWorthButton: document.querySelector("#closeNetWorthButton"),
  cancelNetWorthButton: document.querySelector("#cancelNetWorthButton"),
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
let recurringOccurrenceStatuses = loadRecurringOccurrenceStatuses();
let netWorthItems = loadNetWorthItems();
let planOverrides = loadPlanOverrides();
let currentUser = null;
let dashboardReady = false;
let deletedBulkEntryIds = new Set();
let entryModalContext = null;
let activeAppView = "dashboard";
const collapsedReportCategories = new Set();
let importedCsvRows = [];
let syncState = loadSyncState();
let cloudRefreshInProgress = false;
let lastCloudRefreshAt = 0;

init();

async function init() {
  setupAuthListeners();
  setupTrackerListeners();
  setupCloudRefreshListeners();
  await hydrateAuthState();
  await initializeDashboard();
}

function setupCloudRefreshListeners() {
  window.addEventListener("focus", refreshFromCloudIfReady);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshFromCloudIfReady();
  });
}

async function refreshFromCloudIfReady() {
  if (!currentUser || !dashboardReady || cloudRefreshInProgress) return;
  if (Date.now() - lastCloudRefreshAt < 5000) return;
  cloudRefreshInProgress = true;
  try {
    await hydrateFromSupabase();
    populateAccountOptions();
    render();
    lastCloudRefreshAt = Date.now();
  } finally {
    cloudRefreshInProgress = false;
  }
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
  els.importCsvButton.addEventListener("click", openImportModal);
  els.editPlanButton.addEventListener("click", openPlanModal);
  els.closeEntriesButton.addEventListener("click", closeEntryModal);
  els.closeBulkButton.addEventListener("click", closeBulkModal);
  els.closeImportButton.addEventListener("click", closeImportModal);
  els.closePlanButton.addEventListener("click", closePlanModal);
  els.addBulkRowButton.addEventListener("click", () => addBulkRow());
  els.saveBulkButton.addEventListener("click", saveBulkEntries);
  els.csvFileInput.addEventListener("change", handleCsvFile);
  els.clearImportButton.addEventListener("click", clearImportedCsv);
  els.saveImportButton.addEventListener("click", saveImportedEntries);
  els.planPeriodModeSelect.addEventListener("change", () => {
    const preferredDate = parseDate(els.planMonthSelect.selectedOptions[0]?.dataset.start || getDefaultEntryDateKey());
    populatePlanPeriodOptions(preferredDate);
    renderPlanEditor();
  });
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
  els.addNetWorthButton.addEventListener("click", () => openNetWorthModal());
  els.closeNetWorthButton.addEventListener("click", closeNetWorthModal);
  els.cancelNetWorthButton.addEventListener("click", closeNetWorthModal);
  els.netWorthKindSelect.addEventListener("change", populateNetWorthGroupOptions);
  els.netWorthGroupSelect.addEventListener("change", populateNetWorthSubtypeOptions);
  els.netWorthForm.addEventListener("submit", saveNetWorthItem);
  els.entryModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) closeEntryModal();
  });
  els.planModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-plan-modal]")) closePlanModal();
  });
  els.bulkModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-bulk-modal]")) closeBulkModal();
  });
  els.importModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-import-modal]")) closeImportModal();
  });
  els.recurringModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-recurring-modal]")) closeRecurringModal();
  });
  els.netWorthModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-net-worth-modal]")) closeNetWorthModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEntryModal();
      closeBulkModal();
      closeImportModal();
      closePlanModal();
      closeRecurringModal();
      closeNetWorthModal();
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
      closeImportModal();
      closePlanModal();
      closeRecurringModal();
      closeNetWorthModal();
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
  lastCloudRefreshAt = Date.now();

  populateCategoryOptions();
  populatePlanOptions();
  populateRecurringCategoryOptions();
  populateNetWorthFormOptions();
  populateAccountOptions();
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
  els.netWorthView.hidden = !canShowDashboard || activeAppView !== "netWorth";
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
  els.entryDescriptionInput.value = "";
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
  renderNetWorth();
  updateLiveVariance();
}

function setAppView(view) {
  activeAppView = ["upcoming", "netWorth"].includes(view) ? view : "dashboard";
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
    description: normalizeEntryDescription(els.entryDescriptionInput.value),
    type: els.entryTypeSelect.value,
    date: els.entryDateInput.value,
    category: els.categorySelect.value,
    subcategory: els.subcategorySelect.value,
    accountId: els.accountSelect.value,
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
      const row = document.createElement("button");
      row.className = "entry-row";
      row.type = "button";
      row.setAttribute("aria-label", `Edit entry ${index + 1}`);
      row.innerHTML = `
        <div class="entry-row-main">
          <span class="entry-row-copy">
            <b>${escapeHtml(entry.description || formatDisplayDate(entry.date))}</b>
            ${entry.description ? `<span class="entry-row-date">${formatDisplayDate(entry.date)}</span>` : ""}
            <small>${entry.category || "Unclassified"} · ${entry.subcategory || "No subcategory"} · ${getEntryTypeLabel(entry)}</small>
          </span>
          <strong class="entry-row-amount ${getEntryImpact(entry) < 0 ? "entry-credit" : ""}">${formatEntryAmount(entry)}</strong>
        </div>
        <span class="entry-row-chevron" aria-hidden="true">›</span>
      `;
      row.addEventListener("click", () => renderEditEntry(entry, context));
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
      description: els.entryDescriptionInput.value,
      type: els.entryTypeSelect.value,
      category: els.categorySelect.value,
      subcategory: els.subcategorySelect.value,
      accountId: els.accountSelect.value,
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
      description: els.entryDescriptionInput.value,
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
  els.entryModalSummary.textContent = context.formLabel || (entry ? "Edit entry" : "Add entry");

  const form = document.createElement("form");
  form.className = "edit-entry-form";
  const defaults = context.getDefaults();
  const canDelete = Boolean(entry) && context.allowDelete !== false;
  form.innerHTML = `
    <label>
      Date
      <input name="date" type="date" value="${entry?.date || defaults.date}" required />
    </label>
    <label>
      Amount
      <input name="amount" type="text" inputmode="decimal" value="${entry?.amount ?? defaults.amount ?? ""}" required />
    </label>
    <label>
      Description / merchant
      <input name="description" type="text" maxlength="160" autocomplete="off" value="${escapeAttribute(entry?.description || defaults.description || "")}" placeholder="e.g. Woolworths groceries" />
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
    <label>
      Linked account
      <select name="accountId"></select>
    </label>
    <div class="edit-actions ${entry ? "edit-entry-actions" : ""}">
      <button type="submit">${escapeHtml(context.submitLabel || (entry ? "Save changes" : "Add entry"))}</button>
      <button class="secondary-button" type="button" data-cancel-edit>Cancel</button>
      ${canDelete ? '<button class="entry-delete-action" type="button" data-delete-entry>Remove entry</button>' : ""}
    </div>
  `;

  const typeSelect = form.elements.type;
  const categorySelect = form.elements.category;
  const subcategorySelect = form.elements.subcategory;
  const accountSelect = form.elements.accountId;
  populateEntryTypeSelect(typeSelect, getEntryType(entry) || defaults.type);
  populateCategorySelect(categorySelect, entry?.category || defaults.category);
  populateSubcategorySelect(subcategorySelect, categorySelect.value, entry?.subcategory || defaults.subcategory);
  populateAccountSelect(accountSelect, entry?.accountId || defaults.accountId);

  categorySelect.addEventListener("change", () => {
    populateSubcategorySelect(subcategorySelect, categorySelect.value);
  });
  form.querySelector("[data-cancel-edit]").addEventListener("click", () => {
    if (context.onCancel) {
      context.onCancel();
      return;
    }
    renderEntryList(context);
  });
  form.querySelector("[data-delete-entry]")?.addEventListener("click", () => {
    removeEntry(entry.id);
    renderEntryList(context);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = parseAmount(form.elements.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) return;

    let savedEntry;
    if (entry) {
      entries = entries.map((item) =>
        item.id === entry.id
          ? (savedEntry = {
              ...item,
              date: form.elements.date.value,
              amount,
              description: normalizeEntryDescription(form.elements.description.value),
              type: typeSelect.value,
              category: categorySelect.value,
              subcategory: subcategorySelect.value,
              accountId: accountSelect.value,
              updatedAt: new Date().toISOString(),
            })
          : item,
      );
    } else {
      savedEntry = {
        id: crypto.randomUUID(),
        amount,
        description: normalizeEntryDescription(form.elements.description.value),
        type: typeSelect.value,
        date: form.elements.date.value,
        category: categorySelect.value,
        subcategory: subcategorySelect.value,
        accountId: accountSelect.value,
        source: defaults.source || undefined,
        createdAt: new Date().toISOString(),
      };
      entries.push(savedEntry);
    }
    saveEntries();
    context.onSave?.(savedEntry);
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
    <span>Description / merchant</span>
    <span>Amount</span>
    <span>Type</span>
    <span>Bucket</span>
    <span>Subcategory</span>
    <span>Account</span>
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
    <input class="bulk-description" type="text" maxlength="160" value="${escapeAttribute(entry?.description || "")}" placeholder="Merchant or details" />
    <input class="bulk-amount" type="text" inputmode="decimal" value="${entry?.amount ?? ""}" placeholder="0.00" />
    <select class="bulk-type"></select>
    <select class="bulk-category"></select>
    <select class="bulk-subcategory"></select>
    <select class="bulk-account"></select>
    <button class="secondary-button bulk-remove-button" type="button">Remove</button>
  `;

  const typeSelect = row.querySelector(".bulk-type");
  const categorySelect = row.querySelector(".bulk-category");
  const subcategorySelect = row.querySelector(".bulk-subcategory");
  const accountSelect = row.querySelector(".bulk-account");
  populateEntryTypeSelect(typeSelect, getEntryType(entry) || els.entryTypeSelect.value);
  populateCategorySelect(categorySelect, entry?.category || els.categorySelect.value);
  populateSubcategorySelect(subcategorySelect, categorySelect.value, entry?.subcategory || els.subcategorySelect.value);
  populateAccountSelect(accountSelect, entry?.accountId || "");
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
    const description = normalizeEntryDescription(row.querySelector(".bulk-description").value);
    const type = row.querySelector(".bulk-type").value;
    const category = row.querySelector(".bulk-category").value;
    const subcategory = row.querySelector(".bulk-subcategory").value;
    const accountId = row.querySelector(".bulk-account").value;
    const id = row.dataset.entryId;

    if (!date || !Number.isFinite(amount) || amount <= 0) return;

    if (id && nextEntriesById.has(id)) {
      nextEntriesById.set(id, {
        ...nextEntriesById.get(id),
        amount,
        date,
        description,
        type,
        category,
        subcategory,
        accountId,
        updatedAt: now,
      });
      return;
    }

    const newId = crypto.randomUUID();
    nextEntriesById.set(newId, {
      id: newId,
      amount,
      date,
      description,
      type,
      category,
      subcategory,
      accountId,
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

function openImportModal() {
  renderImportRows();
  els.importModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.csvFileInput.focus();
}

function closeImportModal() {
  els.importModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

async function handleCsvFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    importedCsvRows = parseBankCsv(text).map((row) => ({
      ...row,
      id: crypto.randomUUID(),
      selected: !isImportedDuplicate(row.fingerprint),
      type: row.signedAmount < 0 ? "expense" : "credit",
      category: row.signedAmount < 0 ? els.categorySelect.value : INCOME_SECTION,
      subcategory: row.signedAmount < 0 ? els.subcategorySelect.value : getFirstSubcategory(INCOME_SECTION),
      accountId: "",
    }));
    renderImportRows();
  } catch (error) {
    console.warn("CSV import failed.", error);
    importedCsvRows = [];
    els.importRows.replaceChildren();
    els.importModalSummary.textContent = "Could not read that CSV. Check it has date, description, and amount columns.";
  }
}

function clearImportedCsv() {
  importedCsvRows = [];
  els.csvFileInput.value = "";
  renderImportRows();
}

function renderImportRows() {
  els.importRows.replaceChildren();
  const duplicateCount = importedCsvRows.filter((row) => isImportedDuplicate(row.fingerprint)).length;
  els.importModalSummary.textContent = importedCsvRows.length
    ? `${importedCsvRows.length} rows ready · ${duplicateCount} duplicate ${duplicateCount === 1 ? "match" : "matches"}`
    : "Choose a CSV exported from your bank.";

  const header = document.createElement("div");
  header.className = "import-entry-header";
  header.innerHTML = `
    <span>Import</span>
    <span>Date</span>
    <span>Description</span>
    <span>Amount</span>
    <span>Type</span>
    <span>Bucket</span>
    <span>Subcategory</span>
    <span>Account</span>
  `;
  els.importRows.append(header);

  if (!importedCsvRows.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "No CSV rows loaded yet.";
    els.importRows.append(empty);
    return;
  }

  importedCsvRows.forEach((item) => {
    const row = document.createElement("div");
    const duplicate = isImportedDuplicate(item.fingerprint);
    row.className = `import-entry-row ${duplicate ? "is-duplicate" : ""}`;
    row.dataset.importId = item.id;
    row.innerHTML = `
      <label class="import-check">
        <input class="import-selected" type="checkbox" ${item.selected ? "checked" : ""} ${duplicate ? "disabled" : ""} />
        <span>${duplicate ? "Duplicate" : "Use"}</span>
      </label>
      <input class="import-date" type="date" value="${item.date}" />
      <input class="import-description" type="text" maxlength="160" value="${escapeAttribute(item.description || "Imported transaction")}" />
      <input class="import-amount" type="text" inputmode="decimal" value="${formatPlanInput(item.amount)}" />
      <select class="import-type"></select>
      <select class="import-category"></select>
      <select class="import-subcategory"></select>
      <select class="import-account"></select>
    `;

    const typeSelect = row.querySelector(".import-type");
    const categorySelect = row.querySelector(".import-category");
    const subcategorySelect = row.querySelector(".import-subcategory");
    const accountSelect = row.querySelector(".import-account");
    populateEntryTypeSelect(typeSelect, item.type);
    populateCategorySelect(categorySelect, item.category);
    populateSubcategorySelect(subcategorySelect, categorySelect.value, item.subcategory);
    populateAccountSelect(accountSelect, item.accountId);
    categorySelect.addEventListener("change", () => populateSubcategorySelect(subcategorySelect, categorySelect.value));
    els.importRows.append(row);
  });
}

function saveImportedEntries() {
  const now = new Date().toISOString();
  const importedEntries = [...els.importRows.querySelectorAll(".import-entry-row")]
    .map((row) => {
      const item = importedCsvRows.find((current) => current.id === row.dataset.importId);
      const selected = row.querySelector(".import-selected").checked;
      const amount = parseAmount(row.querySelector(".import-amount").value);
      const date = row.querySelector(".import-date").value;
      if (!item || !selected || !date || !Number.isFinite(amount) || amount <= 0 || isImportedDuplicate(item.fingerprint)) return null;
      return normalizeEntry({
        id: crypto.randomUUID(),
        amount,
        type: row.querySelector(".import-type").value,
        date,
        category: row.querySelector(".import-category").value,
        subcategory: row.querySelector(".import-subcategory").value,
        accountId: row.querySelector(".import-account").value,
        description: normalizeEntryDescription(row.querySelector(".import-description").value),
        source: `${IMPORT_SOURCE_PREFIX}${item.fingerprint}`,
        createdAt: now,
      });
    })
    .filter(Boolean);

  if (!importedEntries.length) {
    els.importModalSummary.textContent = "No new selected rows to save.";
    return;
  }

  entries = [...entries, ...importedEntries];
  saveEntries();
  syncPeriodToDate();
  importedCsvRows = importedCsvRows.map((row) => ({ ...row, selected: false }));
  renderImportRows();
  render();
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
  els.planPeriodModeSelect.value = period.mode === "payCycle" ? "payCycle" : "month";
  populatePlanPeriodOptions(period.start);
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
  els.recurringModalTitle.textContent = item ? "Edit forecast item" : "Add forecast item";
  els.recurringIdInput.value = item?.id || "";
  els.recurringNameInput.value = item?.name || "";
  els.recurringAmountInput.value = item?.amount ?? "";
  els.recurringFrequencySelect.value = item?.frequency || "monthly";
  els.recurringDueDateInput.value = item?.nextDueDate || els.entryDateInput.value || getDefaultEntryDateKey();
  els.recurringEndDateInput.value = item?.endDate || "";
  els.recurringOccurrenceLimitInput.value = item?.occurrenceLimit || "";
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

function openNetWorthModal(item = null) {
  els.netWorthModalTitle.textContent = item ? "Edit net worth item" : "Add asset / liability";
  els.netWorthIdInput.value = item?.id || "";
  els.netWorthKindSelect.value = item?.kind || "asset";
  populateNetWorthGroupOptions(item?.groupName);
  populateNetWorthSubtypeOptions(item?.subtype);
  els.netWorthNameInput.value = item?.name || "";
  els.netWorthValueInput.value = item?.baseValue ?? "";
  els.netWorthModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.netWorthNameInput.focus();
}

function closeNetWorthModal() {
  els.netWorthModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  els.netWorthForm.reset();
  els.netWorthIdInput.value = "";
}

function saveNetWorthItem(event) {
  event.preventDefault();
  const baseValue = parseAmount(els.netWorthValueInput.value);
  if (!Number.isFinite(baseValue) || baseValue < 0) {
    els.netWorthValueInput.focus();
    return;
  }
  const now = new Date().toISOString();
  const id = els.netWorthIdInput.value || crypto.randomUUID();
  const item = {
    id,
    kind: els.netWorthKindSelect.value,
    groupName: els.netWorthGroupSelect.value,
    subtype: els.netWorthSubtypeSelect.value,
    name: els.netWorthNameInput.value.trim(),
    baseValue,
    createdAt: netWorthItems.find((current) => current.id === id)?.createdAt || now,
    updatedAt: now,
  };
  if (!item.name) return;
  netWorthItems = netWorthItems.some((current) => current.id === id)
    ? netWorthItems.map((current) => (current.id === id ? item : current))
    : [...netWorthItems, item];
  saveNetWorthItems();
  populateAccountOptions();
  closeNetWorthModal();
  renderNetWorth();
}

function removeNetWorthItem(id) {
  const now = new Date().toISOString();
  netWorthItems = netWorthItems.filter((item) => item.id !== id);
  entries = entries.map((entry) =>
    entry.accountId === id ? { ...entry, accountId: "", updatedAt: now } : entry,
  );
  saveNetWorthItems();
  saveEntries();
  deleteSupabaseNetWorthItem(id);
  populateAccountOptions();
  renderNetWorth();
  render();
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
  const occurrenceLimit = Number(els.recurringOccurrenceLimitInput.value || 0);
  const item = {
    id,
    name: els.recurringNameInput.value.trim(),
    amount,
    flow: els.recurringFlowSelect.value,
    frequency: els.recurringFrequencySelect.value,
    nextDueDate: els.recurringDueDateInput.value,
    endDate: els.recurringEndDateInput.value || "",
    occurrenceLimit: Number.isInteger(occurrenceLimit) && occurrenceLimit > 0 ? occurrenceLimit : null,
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
  recurringOccurrenceStatuses = recurringOccurrenceStatuses.filter((status) => status.recurringItemId !== id);
  saveRecurringItems();
  saveRecurringOccurrenceStatuses();
  deleteSupabaseRecurringItem(id);
  deleteSupabaseRecurringOccurrenceStatuses(id);
  renderUpcoming();
}

function renderUpcoming() {
  if (!financeData || !els.upcomingOccurrenceList) return;

  const today = startOfDay(new Date());
  const forecast = getForecastRange(els.forecastHorizonSelect.value, today);
  const forecastOccurrences = forecast.mode === "all-bills"
    ? getAllBillOccurrences()
    : getRecurringOccurrences(forecast.start, forecast.end);
  const pendingOccurrences = forecastOccurrences.filter(
    (item) => parseDate(item.date) >= today && !isOccurrenceDone(item),
  );
  const completedOccurrences = getCompletedOccurrences();
  const overdueOccurrences = getOverdueOccurrences(today);
  const moneyInItems = pendingOccurrences.filter((item) => item.flow === "income");
  const moneyOutItems = pendingOccurrences.filter((item) => item.flow === "expense");
  const savedItems = pendingOccurrences.filter((item) => item.flow === "saving");
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

  renderUpcomingOccurrences(pendingOccurrences);
  renderOverdueOccurrences(overdueOccurrences);
  renderCompletedOccurrences(completedOccurrences);
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
  els.occurrenceCountBadge.textContent = `${occurrences.length} ${occurrences.length === 1 ? "item" : "items"}`;
  renderOccurrenceGroups(
    els.upcomingOccurrenceList,
    occurrences,
    "No unresolved items are due in this forecast window.",
  );
}

function renderOverdueOccurrences(occurrences) {
  els.overduePanel.hidden = !occurrences.length;
  els.overdueCountBadge.textContent = `${occurrences.length} overdue`;
  renderOccurrenceGroups(els.overdueOccurrenceList, occurrences, "", { overdue: true });
}

function renderCompletedOccurrences(occurrences) {
  els.completedPanel.hidden = !occurrences.length;
  els.completedCountBadge.textContent = `${occurrences.length} done`;
  renderOccurrenceGroups(els.completedOccurrenceList, occurrences, "", { completed: true });
}

function renderOccurrenceGroups(container, occurrences, emptyText, options = {}) {
  container.replaceChildren();
  if (!occurrences.length) {
    if (emptyText) {
      const empty = document.createElement("p");
      empty.className = "empty-entries";
      empty.textContent = emptyText;
      container.append(empty);
    }
    return;
  }

  const groups = new Map();
  occurrences.forEach((occurrence) => {
    if (!groups.has(occurrence.date)) groups.set(occurrence.date, []);
    groups.get(occurrence.date).push(occurrence);
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
      row.className = `occurrence-row is-${item.flow} ${options.overdue ? "is-overdue" : ""} ${options.completed ? "is-completed" : ""}`;
      row.innerHTML = `
        <span class="occurrence-marker" aria-hidden="true"></span>
        <button class="occurrence-copy occurrence-edit-button" type="button" title="Edit recurring or planned item">
          <b>${escapeHtml(item.name)}</b>
          <small>${RECURRING_FLOWS[item.flow]} · ${item.category} · ${item.subcategory} · ${RECURRENCE_FREQUENCIES[item.frequency]?.label || item.frequency}</small>
        </button>
        <strong class="occurrence-amount">${money(item.amount)}</strong>
        <button class="occurrence-status-button ${options.completed ? "secondary-button" : ""}" type="button">
          ${options.completed ? "Undo" : item.flow === "expense" ? "Mark paid" : "Mark done"}
        </button>
      `;
      row.querySelector(".occurrence-edit-button").addEventListener("click", () => openOccurrenceDefinition(item));
      row.querySelector(".occurrence-status-button").addEventListener("click", () => {
        if (options.completed) {
          setOccurrenceDone(item, false);
          return;
        }
        openOccurrenceEntry(item);
      });
      group.append(row);
    });

    container.append(group);
  });
}

function renderRecurringItems() {
  els.recurringScheduleList.replaceChildren();
  const sortedItems = recurringItems.slice().sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  els.recurringCountBadge.textContent = `${sortedItems.length} active`;

  if (!sortedItems.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "Create a recurring or one-time item to forecast bills, income, or savings.";
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
        <small>Next due ${formatDisplayDate(item.nextDueDate)} · ${item.category} · ${item.subcategory}${getRecurringLimitLabel(item)}</small>
      </span>
      <button type="button" data-edit-recurring="${item.id}">Edit</button>
      <button type="button" data-delete-recurring="${item.id}">Delete</button>
    `;
    row.querySelector("[data-edit-recurring]").addEventListener("click", () => openRecurringModal(item));
    row.querySelector("[data-delete-recurring]").addEventListener("click", () => removeRecurringItem(item.id));
    els.recurringScheduleList.append(row);
  });
}

function renderNetWorth() {
  if (!financeData || !els.assetList) return;
  const balances = getNetWorthBalances();
  const assets = balances.items.filter((item) => item.kind === "asset");
  const liabilities = balances.items.filter((item) => item.kind === "liability");
  const totalAssets = assets.reduce((sum, item) => sum + item.currentValue, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.currentValue, 0);
  const linkedTotal = balances.items.reduce((sum, item) => sum + item.adjustment, 0);
  const netWorth = totalAssets - totalLiabilities;

  els.netWorthBalance.textContent = money(netWorth);
  els.netWorthBalanceCard.classList.toggle("is-good", netWorth >= 0);
  els.netWorthBalanceCard.classList.toggle("is-over", netWorth < 0);
  els.totalAssetsValue.textContent = money(totalAssets);
  els.totalAssetsLabel.textContent = assets.length ? `${assets.length} ${assets.length === 1 ? "asset" : "assets"}` : "No assets yet";
  els.totalLiabilitiesValue.textContent = money(totalLiabilities);
  els.totalLiabilitiesLabel.textContent = liabilities.length
    ? `${liabilities.length} ${liabilities.length === 1 ? "liability" : "liabilities"}`
    : "No liabilities yet";
  els.linkedAccountValue.textContent = money(linkedTotal);
  els.assetCountBadge.textContent = `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`;
  els.liabilityCountBadge.textContent = `${liabilities.length} ${liabilities.length === 1 ? "liability" : "liabilities"}`;

  renderNetWorthList(els.assetList, assets, "No assets yet.");
  renderNetWorthList(els.liabilityList, liabilities, "No liabilities yet.");
}

function getNetWorthBalances() {
  const adjustments = getAccountAdjustments();
  return {
    items: netWorthItems.map((item) => {
      const adjustment = item.kind === "asset" ? adjustments[item.id] || 0 : 0;
      return {
        ...item,
        adjustment,
        currentValue: Number(item.baseValue || 0) + adjustment,
      };
    }),
  };
}

function getAccountAdjustments() {
  return entries.reduce((totals, entry) => {
    if (!entry.accountId) return totals;
    const adjustment = getLinkedAccountAdjustment(entry);
    if (!adjustment) return totals;
    totals[entry.accountId] = (totals[entry.accountId] || 0) + adjustment;
    return totals;
  }, {});
}

function getLinkedAccountAdjustment(entry) {
  if (getEntryType(entry) === "reserve") return -Number(entry.amount || 0);
  if (entry.category === INVESTMENT_SECTION) return Number(entry.amount || 0);
  return 0;
}

function renderNetWorthList(container, items, emptyText) {
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }
  items
    .slice()
    .sort((a, b) => b.currentValue - a.currentValue)
    .forEach((item) => {
      const row = document.createElement("div");
      row.className = `net-worth-row is-${item.kind}`;
      row.innerHTML = `
        <span class="net-worth-copy">
          <b>${escapeHtml(item.name)}</b>
          <small>${item.groupName} · ${item.subtype}${item.adjustment ? ` · ${money(item.adjustment)} linked` : ""}</small>
        </span>
        <strong>${money(item.currentValue)}</strong>
        <button type="button" data-edit-net-worth="${item.id}">Edit</button>
        <button type="button" data-delete-net-worth="${item.id}">Delete</button>
      `;
      row.querySelector("[data-edit-net-worth]").addEventListener("click", () => openNetWorthModal(item));
      row.querySelector("[data-delete-net-worth]").addEventListener("click", () => removeNetWorthItem(item.id));
      container.append(row);
    });
}

function getRecurringOccurrences(start, end) {
  return recurringItems
    .flatMap((item) => expandRecurringItem(item, start, end))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

function getOverdueOccurrences(today = startOfDay(new Date())) {
  return recurringItems
    .flatMap((item) => expandRecurringItem(item, parseDate(item.nextDueDate), today))
    .filter((item) => !isOccurrenceDone(item))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

function getCompletedOccurrences() {
  const recurringById = new Map(recurringItems.map((item) => [item.id, item]));
  return recurringOccurrenceStatuses
    .filter((status) => status.completed && recurringById.has(status.recurringItemId))
    .map((status) => ({
      ...recurringById.get(status.recurringItemId),
      date: status.occurrenceDate,
      completedAt: status.completedAt,
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}

function getAllBillOccurrences() {
  return recurringItems
    .filter((item) => item.flow === "expense")
    .map((item) => ({ ...item, date: item.nextDueDate }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

function getOccurrenceStatusId(item) {
  return `${item.id}::${item.date}`;
}

function isOccurrenceDone(item) {
  const status = recurringOccurrenceStatuses.find((current) => current.id === getOccurrenceStatusId(item));
  return Boolean(status?.completed);
}

function setOccurrenceDone(item, completed) {
  const now = new Date().toISOString();
  const id = getOccurrenceStatusId(item);
  const existing = recurringOccurrenceStatuses.find((status) => status.id === id);
  const status = {
    id,
    recurringItemId: item.id,
    occurrenceDate: item.date,
    completed,
    completedAt: completed ? now : null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  recurringOccurrenceStatuses = existing
    ? recurringOccurrenceStatuses.map((current) => (current.id === id ? status : current))
    : [...recurringOccurrenceStatuses, status];
  saveRecurringOccurrenceStatuses();
  renderUpcoming();
}

function getOccurrenceEntrySource(item) {
  return `forecast-occurrence:${getOccurrenceStatusId(item)}`;
}

function openOccurrenceEntry(item) {
  const source = getOccurrenceEntrySource(item);
  const existingEntry = entries.find((entry) => entry.source === source) || null;
  const actionLabel = item.flow === "expense" ? "paid bill" : item.flow === "income" ? "received income" : "completed investment";
  const context = {
    title: item.name,
    formLabel: existingEntry ? `Review ${actionLabel} entry` : `Confirm ${actionLabel}`,
    submitLabel: existingEntry ? "Save and mark done" : "Add entry and mark done",
    allowDelete: false,
    getEntries: () => entries.filter((entry) => entry.source === source),
    getSummary: () => "",
    getDefaults: () => ({
      date: item.date,
      amount: item.amount,
      description: item.name,
      type: "expense",
      category: item.category,
      subcategory: item.subcategory,
      accountId: "",
      source,
    }),
    onCancel: closeEntryModal,
    onSave: () => {
      setOccurrenceDone(item, true);
      closeEntryModal();
    },
  };

  els.entryModalTitle.textContent = item.name;
  renderEditEntry(existingEntry, context);
  els.entryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closeEntriesButton.focus();
}

function openOccurrenceDefinition(item) {
  const recurringItem = recurringItems.find((current) => current.id === item.id);
  if (recurringItem) openRecurringModal(recurringItem);
}

function expandRecurringItem(item, start, end) {
  const occurrences = [];
  let dueDate = parseDate(item.nextDueDate);
  if (item.frequency === "once") {
    return isRecurringDateAllowed(item, dueDate, 1) && dueDate >= start && dueDate < end ? [{ ...item, date: dateKey(dueDate) }] : [];
  }
  let guard = 0;
  let occurrenceNumber = 1;

  while (dueDate < start && guard < 400) {
    dueDate = getNextRecurringDate(dueDate, item.frequency);
    occurrenceNumber += 1;
    guard += 1;
  }

  while (dueDate < end && guard < 800 && isRecurringDateAllowed(item, dueDate, occurrenceNumber)) {
    occurrences.push({ ...item, date: dateKey(dueDate) });
    dueDate = getNextRecurringDate(dueDate, item.frequency);
    occurrenceNumber += 1;
    guard += 1;
  }

  return occurrences;
}

function isRecurringDateAllowed(item, dueDate, occurrenceNumber) {
  if (item.endDate && dueDate > parseDate(item.endDate)) return false;
  if (item.occurrenceLimit && occurrenceNumber > Number(item.occurrenceLimit)) return false;
  return true;
}

function getNextRecurringDate(date, frequency) {
  const config = RECURRENCE_FREQUENCIES[frequency] || RECURRENCE_FREQUENCIES.monthly;
  if (config.days) return addDays(date, config.days);
  return addCalendarMonths(date, config.months || 1);
}

function sumOccurrenceAmounts(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getRecurringLimitLabel(item) {
  const labels = [];
  if (item.endDate) labels.push(`ends ${formatDisplayDate(item.endDate)}`);
  if (item.occurrenceLimit) labels.push(`${item.occurrenceLimit} ${Number(item.occurrenceLimit) === 1 ? "occurrence" : "occurrences"}`);
  return labels.length ? ` · ${labels.join(" · ")}` : "";
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

function populateNetWorthFormOptions() {
  populateNetWorthGroupOptions();
}

function populateNetWorthGroupOptions(selectedValue = "") {
  const groups = Object.keys(NET_WORTH_TAXONOMY[els.netWorthKindSelect.value] || {});
  els.netWorthGroupSelect.replaceChildren();
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    els.netWorthGroupSelect.append(option);
  });
  if (selectedValue && groups.includes(selectedValue)) els.netWorthGroupSelect.value = selectedValue;
  populateNetWorthSubtypeOptions();
}

function populateNetWorthSubtypeOptions(selectedValue = "") {
  const subtypes = NET_WORTH_TAXONOMY[els.netWorthKindSelect.value]?.[els.netWorthGroupSelect.value] || [];
  els.netWorthSubtypeSelect.replaceChildren();
  subtypes.forEach((subtype) => {
    const option = document.createElement("option");
    option.value = subtype;
    option.textContent = subtype;
    els.netWorthSubtypeSelect.append(option);
  });
  if (selectedValue && subtypes.includes(selectedValue)) els.netWorthSubtypeSelect.value = selectedValue;
}

function populateAccountOptions() {
  populateAccountSelect(els.accountSelect);
}

function populateAccountSelect(select, selectedValue = "") {
  select.replaceChildren();
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "No linked account";
  select.append(none);
  getLinkableAccounts().forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  });
  if (selectedValue) select.value = selectedValue;
}

function getLinkableAccounts() {
  return netWorthItems
    .filter((item) => item.kind === "asset")
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getRecurringDefaultCategory(flow) {
  if (flow === "income") return INCOME_SECTION;
  if (flow === "saving") return INVESTMENT_SECTION;
  return EXPENSE_SECTIONS[0];
}

function populatePlanOptions() {
  els.planSectionSelect.replaceChildren();

  financeData.sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.name;
    option.textContent = section.name;
    els.planSectionSelect.append(option);
  });
  populatePlanPeriodOptions();
}

function populatePlanPeriodOptions(preferredDate = startOfDay(new Date())) {
  const mode = els.planPeriodModeSelect.value;
  const planPeriods = buildPeriods(mode);
  els.planMonthSelect.replaceChildren();
  planPeriods.forEach((period) => {
    const option = document.createElement("option");
    option.value = period.id;
    option.textContent = period.label;
    option.dataset.start = dateKey(period.start);
    els.planMonthSelect.append(option);
  });
  const matchingPeriod = planPeriods.find((period) => preferredDate >= period.start && preferredDate < period.end);
  if (matchingPeriod) els.planMonthSelect.value = matchingPeriod.id;
}

function getSelectedPlanPeriod() {
  return buildPeriods(els.planPeriodModeSelect.value)
    .find((period) => period.id === els.planMonthSelect.value);
}

function renderPlanEditor() {
  const period = getSelectedPlanPeriod();
  const section = getSection(els.planSectionSelect.value);
  if (!period || !section) return;
  const isMonthly = period.mode === "month";
  els.planEditorList.replaceChildren();
  els.planEditorSummary.replaceChildren();
  els.planEditActions.hidden = !isMonthly;
  renderPlanOverview(period);

  const sectionMetrics = getBudgetTargetMetrics(section, null, period);
  const sectionStatus = getBudgetTargetStatus(section.name, sectionMetrics.remaining);
  els.planEditorSummary.innerHTML = `
    <div><span>Period target</span><strong>${money(sectionMetrics.target)}</strong></div>
    <div><span>Actual</span><strong>${money(sectionMetrics.actual)}</strong></div>
    <div><span>Upcoming</span><strong>${money(sectionMetrics.upcoming)}</strong></div>
    <div class="${sectionStatus}">
      <span>Remaining after upcoming</span>
      <strong>${formatRemainingMoney(sectionMetrics.remaining)}</strong>
    </div>
  `;

  if (!isMonthly) {
    const monthKeys = getPlanMonthsForRange(period.start, period.end);
    const editMonths = document.createElement("div");
    editMonths.className = "pay-cycle-month-actions";
    const label = document.createElement("span");
    label.textContent = "Pay-cycle targets are calculated from monthly budgets:";
    editMonths.append(label);
    monthKeys.forEach((monthKey) => {
      const month = financeData.months.find((item) => item.key === monthKey);
      const button = document.createElement("button");
      button.className = "secondary-button";
      button.type = "button";
      button.textContent = `Edit ${month?.label || monthKey}`;
      button.addEventListener("click", () => {
        els.planPeriodModeSelect.value = "month";
        populatePlanPeriodOptions(parseDate(`${monthKey}-01`));
        renderPlanEditor();
      });
      editMonths.append(button);
    });
    els.planEditorSummary.append(editMonths);
  }

  section.rows.forEach((row) => {
    const metrics = getBudgetTargetMetrics(section, row, period);
    const status = getBudgetTargetStatus(section.name, metrics.remaining);
    const isOverBudget = status === "is-over";
    const monthKey = isMonthly ? period.id : "";
    const baseValue = isMonthly ? row.values[monthKey] ?? 0 : 0;
    const value = isMonthly ? getRowValue(row, section.name, monthKey) : metrics.target;
    const hasOverride = isMonthly && hasPlanOverride(section.name, row.name, monthKey);
    const item = document.createElement("div");
    item.className = `plan-row budget-target-row ${hasOverride ? "has-override" : ""} ${isOverBudget ? "is-over" : ""} ${isMonthly ? "" : "is-readonly"}`;
    item.innerHTML = `
      <span class="budget-target-name">
        <b>${row.name}</b>
        <small>${isMonthly ? `Spreadsheet: ${money(baseValue)}${hasOverride ? " · edited" : ""}` : "Calculated proportionally from monthly targets"}</small>
      </span>
      <div class="budget-target-metrics">
        <span><small>Target</small><strong>${money(metrics.target)}</strong></span>
        <span><small>Actual</small><strong>${money(metrics.actual)}</strong></span>
        <span><small>Upcoming</small><strong>${money(metrics.upcoming)}</strong></span>
        <span class="${status}">
          <small>Remaining</small><strong>${formatRemainingMoney(metrics.remaining)}</strong>
        </span>
      </div>
      ${isMonthly ? `<label class="budget-target-input">Monthly target<input type="text" inputmode="decimal" value="${formatPlanInput(value)}" data-row-name="${escapeAttribute(row.name)}" /></label>` : ""}
      ${isOverBudget ? `<p class="budget-warning">${money(Math.abs(metrics.remaining))} over target after upcoming items</p>` : ""}
    `;
    item.querySelector("input[data-row-name]")?.addEventListener("input", () => renderPlanOverview(period));
    els.planEditorList.append(item);
  });
}

function renderPlanOverview(period) {
  const plannedIncome = getPlannedSectionTotalForOverview(getSection(INCOME_SECTION), period);
  const plannedExpenses = getExpenseSections().reduce(
    (sum, section) => sum + getPlannedSectionTotalForOverview(section, period),
    0,
  );
  const plannedInvestments = getPlannedSectionTotalForOverview(getSection(INVESTMENT_SECTION), period);
  const availableBeforeInvestments = plannedIncome - plannedExpenses;
  const finalBalance = availableBeforeInvestments - plannedInvestments;

  els.planOverviewSummary.innerHTML = `
    <div><span>Planned income</span><strong>${money(plannedIncome)}</strong></div>
    <div><span>Planned expenses</span><strong>-${money(plannedExpenses)}</strong></div>
    <div><span>Available before investments</span><strong>${formatRemainingMoney(availableBeforeInvestments)}</strong></div>
    <div><span>Planned investments</span><strong>-${money(plannedInvestments)}</strong></div>
    <div class="plan-final-balance ${finalBalance >= 0 ? "is-positive" : "is-negative"}">
      <span>Final planned balance</span>
      <strong>${formatRemainingMoney(finalBalance)}</strong>
    </div>
  `;

  els.planOverviewMessage.className = `plan-overview-message ${finalBalance >= 0 ? "is-positive" : "is-negative"}`;
  if (finalBalance > 0) {
    els.planOverviewMessage.innerHTML = `
      <b>${money(finalBalance)} remains unallocated</b>
      <span>You can increase investments or expenses by up to ${money(finalBalance)} while keeping the plan balanced.</span>
    `;
  } else if (finalBalance < 0) {
    els.planOverviewMessage.innerHTML = `
      <b>${money(Math.abs(finalBalance))} over planned income</b>
      <span>Reduce expenses or investments by ${money(Math.abs(finalBalance))}, or increase planned income by the same amount.</span>
    `;
  } else {
    els.planOverviewMessage.innerHTML = `
      <b>Plan is fully allocated</b>
      <span>Planned income exactly covers all expenses and investments.</span>
    `;
  }
}

function getPlannedSectionTotalForOverview(section, period) {
  if (!section) return 0;
  const isEditingThisSection =
    period.mode === "month" &&
    section.name === els.planSectionSelect.value &&
    els.planEditorList.querySelector("input[data-row-name]");

  if (isEditingThisSection) {
    return [...els.planEditorList.querySelectorAll("input[data-row-name]")]
      .reduce((sum, input) => {
        const amount = parseAmount(input.value);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);
  }

  return getBudgetForRange(period.start, period.end, [section]);
}

function getBudgetTargetMetrics(section, row, period) {
  const target = row
    ? getRowBudgetForRange(row, period.start, period.end)
    : getBudgetForRange(period.start, period.end, [section]);
  const periodEntries = getEntriesForPeriod(period).filter((entry) => {
    if (entry.category !== section.name) return false;
    return !row || entry.subcategory === row.name;
  });
  const actual = section.name === INCOME_SECTION
    ? sumEntries(periodEntries)
    : section.name === INVESTMENT_SECTION
      ? sumEntries(periodEntries)
      : sumEntryImpacts(periodEntries);
  const upcoming = getUnresolvedOccurrencesForRange(period.start, period.end)
    .filter((item) => {
      if (item.category !== section.name) return false;
      if (item.flow !== getTargetFlowForSection(section.name)) return false;
      return !row || item.subcategory === row.name;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return { target, actual, upcoming, remaining: target - actual - upcoming };
}

function getTargetFlowForSection(sectionName) {
  if (sectionName === INCOME_SECTION) return "income";
  if (sectionName === INVESTMENT_SECTION) return "saving";
  return "expense";
}

function getBudgetTargetStatus(sectionName, remaining) {
  if (isExpenseCategory(sectionName)) return remaining < 0 ? "is-over" : "is-good";
  return remaining <= 0 ? "is-good" : "";
}

function getUnresolvedOccurrencesForRange(start, end) {
  return getRecurringOccurrences(start, end).filter((item) => !isOccurrenceDone(item));
}

function getPlanMonthsForRange(start, end) {
  return financeData.months
    .filter((month) => getOverlapDays(start, end, monthStart(month.key), addMonths(monthStart(month.key), 1)) > 0)
    .map((month) => month.key);
}

function formatRemainingMoney(value) {
  return value < 0 ? `-${money(Math.abs(value))}` : money(value);
}

function savePlanEditor() {
  if (els.planPeriodModeSelect.value !== "month") return;
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
  if (els.planPeriodModeSelect.value !== "month") return;
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
  const upcomingOccurrences = getUnresolvedOccurrencesForRange(period.start, period.end);
  const incomeTarget = getBudgetForRange(period.start, period.end, [getSection(INCOME_SECTION)]);

  getExpenseSections().forEach((section) => {
    const target = getBudgetForRange(period.start, period.end, [section]);
    const actual = sumEntryImpacts(
      periodEntries.filter((entry) => entry.category === section.name),
    );
    const upcoming = sumOccurrenceAmounts(
      upcomingOccurrences.filter((item) => item.flow === "expense" && item.category === section.name),
    );
    const remaining = target - actual - upcoming;
    const share = incomeTarget > 0 ? Math.round((target / incomeTarget) * 100) : 0;
    const pace = getPaceInfo({ actual, target, period, kind: "expense" });

    const row = document.createElement("div");
    row.className = `category-row ${pace.className} ${remaining < 0 ? "is-projected-over" : ""}`;
    row.innerHTML = `
      <div>
        <div class="category-name">${section.name}</div>
        <small>${share}% of period income</small>
        <div class="category-budget-values">
          <span><small>Actual</small><strong>${money(actual)}</strong></span>
          <span><small>Upcoming</small><strong>${money(upcoming)}</strong></span>
          <span class="${remaining < 0 ? "is-over" : "is-good"}"><small>Remaining</small><strong>${formatRemainingMoney(remaining)}</strong></span>
        </div>
        <div class="pace-line">
          <span class="status-pill">${pace.label}</span>
          <span>${remaining < 0 ? `${money(Math.abs(remaining))} over after upcoming` : `${money(remaining)} available after upcoming`}</span>
        </div>
      </div>
      <div class="money"><small>Target</small>${money(target)}</div>
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
  const savingsUpcoming = sumOccurrenceAmounts(
    upcomingOccurrences.filter((item) => item.flow === "saving" && item.category === INVESTMENT_SECTION),
  );
  const savingsRemaining = savingsTarget - savingsActual - savingsUpcoming;
  const savingsShare = incomeTarget > 0 ? Math.round((savingsTarget / incomeTarget) * 100) : 0;
  const savingsPace = getPaceInfo({ actual: savingsActual, target: savingsTarget, period, kind: "savings" });
  const savingsRow = document.createElement("div");
  savingsRow.className = `category-row savings-row ${savingsPace.className}`;
  savingsRow.innerHTML = `
    <div>
      <div class="category-name">Savings</div>
      <small>${savingsShare}% of period income</small>
      <div class="category-budget-values">
        <span><small>Actual</small><strong>${money(savingsActual)}</strong></span>
        <span><small>Upcoming</small><strong>${money(savingsUpcoming)}</strong></span>
        <span class="${savingsRemaining <= 0 ? "is-good" : ""}"><small>Remaining</small><strong>${formatRemainingMoney(savingsRemaining)}</strong></span>
      </div>
      <div class="pace-line">
        <span class="status-pill">${savingsPace.label}</span>
        <span>${savingsRemaining < 0 ? `${money(Math.abs(savingsRemaining))} ahead after upcoming` : `${money(savingsRemaining)} remaining to schedule`}</span>
      </div>
    </div>
    <div class="money"><small>Target</small>${money(savingsTarget)}</div>
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
    const isCollapsed = collapsedReportCategories.has(group.category);
    const card = createReportBucketCard({
      group,
      maxValue,
      isCollapsed,
    });
    els.entryReportList.append(card);
  });
}

function createReportBucketCard({ group, maxValue, isCollapsed }) {
  const card = document.createElement("article");
  card.className = `report-bucket-card ${group.total < 0 ? "is-negative" : "is-positive"}`;

  const header = document.createElement("button");
  header.className = "report-bucket-header";
  header.type = "button";
  header.setAttribute("aria-expanded", String(!isCollapsed));
  header.innerHTML = `
    <span class="report-icon">${getReportInitials(group.category)}</span>
    <span class="report-copy">
      <b>${group.category}</b>
      <small>${group.rows.length} ${group.rows.length === 1 ? "subcategory" : "subcategories"} · ${group.entries.length} ${group.entries.length === 1 ? "entry" : "entries"}</small>
    </span>
    <span class="report-money">${formatReportMoney(group.total)}</span>
    <span class="report-bar" aria-hidden="true">
      <span style="width:${(Math.abs(group.total) / maxValue) * 100}%"></span>
    </span>
    <span class="report-toggle" aria-hidden="true">${isCollapsed ? "+" : "-"}</span>
  `;
  header.addEventListener("click", () => {
    if (collapsedReportCategories.has(group.category)) {
      collapsedReportCategories.delete(group.category);
    } else {
      collapsedReportCategories.add(group.category);
    }
    render();
  });

  card.append(header);
  if (!isCollapsed) {
    const subcategoryList = document.createElement("div");
    subcategoryList.className = "report-subcategory-list";
    group.rows
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .forEach((item) => subcategoryList.append(createReportSubcategoryRow(item, maxValue)));
    card.append(subcategoryList);
  }
  return card;
}

function createReportSubcategoryRow(item, maxValue) {
  const row = document.createElement("button");
  row.className = `report-subcategory-row ${item.total < 0 ? "is-negative" : "is-positive"}`;
  row.type = "button";
  row.innerHTML = `
    <span class="report-copy">
      <b>${item.subcategory}</b>
      <small>${item.entries.length} ${item.entries.length === 1 ? "entry" : "entries"}</small>
    </span>
    <span class="report-money">${formatReportMoney(item.total)}</span>
    <span class="report-bar" aria-hidden="true">
      <span style="width:${(Math.abs(item.total) / maxValue) * 100}%"></span>
    </span>
  `;
  row.addEventListener("click", () => openReportEntries({
    title: item.subcategory,
    category: item.category,
    subcategory: item.subcategory,
  }));
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
    { label: "Fire extinguisher (Saving)", names: ["Fire extinguisher (Saving)"] },
    { label: "Smile (Saving)", names: ["Smile (Saving)"] },
    { label: "Investment USA", names: ["eToro Alex", "Stake Alex", "IBKR"] },
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

function normalizeFinanceData(data) {
  if (!data?.sections) return data;
  const investmentSection = data.sections.find((section) => section.name === INVESTMENT_SECTION);
  const monthValues = Object.fromEntries((data.months || []).map((month) => [month.key, 0]));

  if (investmentSection?.rows) {
    const rowsByName = new Map();
    investmentSection.rows.forEach((row) => {
      const name = normalizeInvestmentSubcategory(row.name);
      const values = { ...(row.values || {}) };
      if (!rowsByName.has(name)) {
        rowsByName.set(name, { ...row, name, values });
        return;
      }

      const existing = rowsByName.get(name);
      Object.entries(values).forEach(([monthKey, amount]) => {
        existing.values[monthKey] = Number(existing.values[monthKey] || 0) + Number(amount || 0);
      });
    });

    INVESTMENT_EXTRA_SUBCATEGORIES.forEach((name) => {
      if (!rowsByName.has(name)) rowsByName.set(name, { name, values: { ...monthValues } });
    });
    investmentSection.rows = [...rowsByName.values()];
  }

  const splurgeSection = data.sections.find((section) => section.name === "Splurge");
  if (splurgeSection?.rows) {
    const existingNames = new Set(splurgeSection.rows.map((row) => row.name));
    SPLURGE_EXTRA_SUBCATEGORIES.forEach((name) => {
      if (!existingNames.has(name)) splurgeSection.rows.push({ name, values: { ...monthValues } });
    });
  }

  return data;
}

function normalizeInvestmentSubcategory(name) {
  return INVESTMENT_SUBCATEGORY_RENAMES.get(name) || name;
}

function normalizeEntry(entry) {
  if (!entry) return entry;
  return {
    ...entry,
    description: normalizeEntryDescription(entry.description),
    subcategory:
      entry.category === INVESTMENT_SECTION
        ? normalizeInvestmentSubcategory(entry.subcategory)
        : entry.subcategory,
  };
}

function normalizeEntryDescription(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 160);
}

function normalizeRecurringItem(item) {
  if (item?.category !== INVESTMENT_SECTION) return item;
  return { ...item, subcategory: normalizeInvestmentSubcategory(item.subcategory) };
}

function normalizePlanOverrides(overrides) {
  return Object.entries(overrides || {}).reduce((nextOverrides, [key, amount]) => {
    const [sectionName, rowName, monthKey] = key.split("::");
    if (sectionName === INVESTMENT_SECTION) {
      nextOverrides[getPlanOverrideKey(sectionName, normalizeInvestmentSubcategory(rowName), monthKey)] = amount;
      return nextOverrides;
    }
    nextOverrides[key] = amount;
    return nextOverrides;
  }, {});
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
  entries = entries.map(normalizeEntry);
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
      return normalizeFinanceData(data.data);
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

    const localData = normalizeFinanceData(await response.json());
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

    entries = mergeSyncedRecords(
      entries.map(normalizeEntry),
      (remoteEntries || []).map(fromSupabaseEntry),
      "entries",
      (a, b) => String(a.date).localeCompare(String(b.date)),
    );
    const remotePlanOverrides = normalizePlanOverrides(
      Object.fromEntries((remoteOverrides || []).map((row) => [fromSupabaseKey(row.override_key), Number(row.amount)])),
    );
    planOverrides = shouldPreserveLocalPlanOverrides()
      ? { ...remotePlanOverrides, ...planOverrides }
      : remotePlanOverrides;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planOverrides));
    await Promise.all([pushEntriesToSupabase(), pushPlanOverridesToSupabase()]);
    await hydrateRecurringItemsFromSupabase();
    await hydrateRecurringOccurrenceStatusesFromSupabase();
    await hydrateNetWorthItemsFromSupabase();
    setSyncStatus("Supabase sync on", "online");
  } catch (error) {
    console.warn("Supabase sync is not ready yet.", error);
    setSyncStatus("Local backup only - run Supabase setup", "warning");
  }
}

function syncEntriesToSupabase() {
  pushEntriesToSupabase().catch((error) => {
    console.warn("Entry sync failed.", error);
    setSyncStatus("Local backup only - Supabase not ready", "warning");
  });
}

async function pushEntriesToSupabase() {
  if (!currentUser) return;
  if (entries.length) {
    const { error } = await supabase
      .from(ENTRIES_TABLE)
      .upsert(entries.map(toSupabaseEntry), { onConflict: "id" });
    if (error) throw error;
  }
  markDatasetSynced("entries");
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
  markDatasetSynced("entries");
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
    description: entry.description || null,
    linked_account_id: entry.accountId ? toSupabaseKey(entry.accountId) : null,
    source: entry.source || null,
    created_at: entry.createdAt || new Date().toISOString(),
    updated_at: entry.updatedAt || entry.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseEntry(row) {
  return normalizeEntry({
    id: fromSupabaseKey(row.id),
    amount: Number(row.amount || 0),
    type: row.entry_type || "expense",
    date: row.entry_date,
    category: row.category,
    subcategory: row.subcategory || "",
    description: row.description || "",
    accountId: row.linked_account_id ? fromSupabaseKey(row.linked_account_id) : "",
    source: row.source || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

async function hydrateRecurringItemsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from(RECURRING_TABLE)
      .select("*")
      .eq("user_id", currentUser.id);
    if (error) throw error;

    recurringItems = mergeSyncedRecords(
      recurringItems.map(normalizeRecurringItem),
      (data || []).map(fromSupabaseRecurringItem),
      "recurring",
      (a, b) => a.nextDueDate.localeCompare(b.nextDueDate),
    );
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringItems));
    await pushRecurringItemsToSupabase();
  } catch (error) {
    console.warn("Recurring item sync is not ready yet.", error);
  }
}

function saveRecurringItems() {
  recurringItems = recurringItems.map(normalizeRecurringItem);
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringItems));
  pushRecurringItemsToSupabase().catch((error) => {
    console.warn("Recurring item sync failed.", error);
    setSyncStatus("Recurring items saved locally - run Supabase setup", "warning");
  });
}

async function pushRecurringItemsToSupabase() {
  if (!currentUser) return;
  if (recurringItems.length) {
    const { error } = await supabase
      .from(RECURRING_TABLE)
      .upsert(recurringItems.map(toSupabaseRecurringItem), { onConflict: "id" });
    if (error) throw error;
  }
  markDatasetSynced("recurring");
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
  markDatasetSynced("recurring");
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
    end_date: item.endDate || null,
    occurrence_limit: item.occurrenceLimit || null,
    category: item.category,
    subcategory: item.subcategory || null,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseRecurringItem(row) {
  return normalizeRecurringItem({
    id: fromSupabaseKey(row.id),
    name: row.name,
    amount: Number(row.amount || 0),
    flow: row.flow,
    frequency: row.frequency,
    nextDueDate: row.next_due_date,
    endDate: row.end_date || "",
    occurrenceLimit: row.occurrence_limit || null,
    category: row.category,
    subcategory: row.subcategory || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

async function hydrateRecurringOccurrenceStatusesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from(RECURRING_STATUS_TABLE)
      .select("*")
      .eq("user_id", currentUser.id);
    if (error) throw error;
    recurringOccurrenceStatuses = mergeSyncedRecords(
      recurringOccurrenceStatuses,
      (data || []).map(fromSupabaseRecurringOccurrenceStatus),
      "recurringStatuses",
      (a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate),
    );
    localStorage.setItem(RECURRING_STATUS_STORAGE_KEY, JSON.stringify(recurringOccurrenceStatuses));
    await pushRecurringOccurrenceStatusesToSupabase();
  } catch (error) {
    console.warn("Recurring occurrence status sync is not ready yet.", error);
  }
}

function saveRecurringOccurrenceStatuses() {
  localStorage.setItem(RECURRING_STATUS_STORAGE_KEY, JSON.stringify(recurringOccurrenceStatuses));
  pushRecurringOccurrenceStatusesToSupabase().catch((error) => {
    console.warn("Recurring occurrence status sync failed.", error);
    setSyncStatus("Occurrence status saved locally - Supabase unavailable", "warning");
  });
}

async function pushRecurringOccurrenceStatusesToSupabase() {
  if (!currentUser) return;
  if (recurringOccurrenceStatuses.length) {
    const { error } = await supabase
      .from(RECURRING_STATUS_TABLE)
      .upsert(recurringOccurrenceStatuses.map(toSupabaseRecurringOccurrenceStatus), { onConflict: "id" });
    if (error) throw error;
  }
  markDatasetSynced("recurringStatuses");
  setSyncStatus("Supabase sync on", "online");
}

async function deleteSupabaseRecurringOccurrenceStatuses(recurringItemId) {
  if (!currentUser) return;
  const { error } = await supabase
    .from(RECURRING_STATUS_TABLE)
    .delete()
    .eq("recurring_item_id", toSupabaseKey(recurringItemId))
    .eq("user_id", currentUser.id);
  if (error) {
    console.warn("Recurring occurrence status cleanup failed.", error);
    return;
  }
  markDatasetSynced("recurringStatuses");
}

function toSupabaseRecurringOccurrenceStatus(status) {
  return {
    id: toSupabaseKey(status.id),
    user_id: currentUser.id,
    recurring_item_id: toSupabaseKey(status.recurringItemId),
    occurrence_date: status.occurrenceDate,
    completed: Boolean(status.completed),
    completed_at: status.completedAt || null,
    created_at: status.createdAt || new Date().toISOString(),
    updated_at: status.updatedAt || status.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseRecurringOccurrenceStatus(row) {
  return {
    id: fromSupabaseKey(row.id),
    recurringItemId: fromSupabaseKey(row.recurring_item_id),
    occurrenceDate: row.occurrence_date,
    completed: Boolean(row.completed),
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function hydrateNetWorthItemsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from(NET_WORTH_TABLE)
      .select("*")
      .eq("user_id", currentUser.id);
    if (error) throw error;
    netWorthItems = mergeSyncedRecords(
      netWorthItems,
      (data || []).map(fromSupabaseNetWorthItem),
      "netWorth",
      (a, b) => a.name.localeCompare(b.name),
    );
    localStorage.setItem(NET_WORTH_STORAGE_KEY, JSON.stringify(netWorthItems));
    await pushNetWorthItemsToSupabase();
  } catch (error) {
    console.warn("Net worth sync is not ready yet.", error);
  }
}

function saveNetWorthItems() {
  localStorage.setItem(NET_WORTH_STORAGE_KEY, JSON.stringify(netWorthItems));
  pushNetWorthItemsToSupabase().catch((error) => {
    console.warn("Net worth sync failed.", error);
    setSyncStatus("Net worth saved locally - run Supabase setup", "warning");
  });
}

async function pushNetWorthItemsToSupabase() {
  if (!currentUser) return;
  if (netWorthItems.length) {
    const { error } = await supabase
      .from(NET_WORTH_TABLE)
      .upsert(netWorthItems.map(toSupabaseNetWorthItem), { onConflict: "id" });
    if (error) throw error;
  }
  markDatasetSynced("netWorth");
  setSyncStatus("Supabase sync on", "online");
}

async function deleteSupabaseNetWorthItem(id) {
  if (!currentUser) return;
  const { error } = await supabase
    .from(NET_WORTH_TABLE)
    .delete()
    .eq("id", toSupabaseKey(id))
    .eq("user_id", currentUser.id);
  if (error) {
    console.warn("Net worth delete sync failed.", error);
    setSyncStatus("Net worth deleted locally - run Supabase setup", "warning");
    return;
  }
  markDatasetSynced("netWorth");
  setSyncStatus("Supabase sync on", "online");
}

function toSupabaseNetWorthItem(item) {
  return {
    id: toSupabaseKey(item.id),
    user_id: currentUser.id,
    kind: item.kind,
    group_name: item.groupName,
    subtype: item.subtype,
    name: item.name,
    base_value: Number(item.baseValue || 0),
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

function fromSupabaseNetWorthItem(row) {
  return {
    id: fromSupabaseKey(row.id),
    kind: row.kind,
    groupName: row.group_name,
    subtype: row.subtype,
    name: row.name,
    baseValue: Number(row.base_value || 0),
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
  planOverrides = normalizePlanOverrides(planOverrides);
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planOverrides));
  localStorage.setItem(PLAN_DIRTY_STORAGE_KEY, new Date().toISOString());
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
  if (payload.length) {
    const { error } = await supabase
      .from(PLAN_OVERRIDES_TABLE)
      .upsert(payload, { onConflict: "override_key" });
    if (error) throw error;
  }
  localStorage.removeItem(PLAN_DIRTY_STORAGE_KEY);
  markDatasetSynced("planOverrides");
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
  markDatasetSynced("planOverrides");
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

function loadSyncState() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_STATE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function markDatasetSynced(dataset) {
  syncState = { ...syncState, [dataset]: new Date().toISOString() };
  localStorage.setItem(SYNC_STATE_STORAGE_KEY, JSON.stringify(syncState));
}

function getRecordTimestamp(record) {
  const value = record?.updatedAt || record?.createdAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function mergeSyncedRecords(localItems, remoteItems, dataset, sortItems) {
  const remoteById = new Map(remoteItems.map((item) => [item.id, item]));
  const merged = new Map(remoteById);
  const lastSyncedAt = syncState[dataset] ? new Date(syncState[dataset]).getTime() : 0;
  const latestRemoteTimestamp = remoteItems.reduce(
    (latest, item) => Math.max(latest, getRecordTimestamp(item)),
    0,
  );

  localItems.forEach((localItem) => {
    const remoteItem = remoteById.get(localItem.id);
    if (remoteItem) {
      merged.set(
        localItem.id,
        getRecordTimestamp(localItem) > getRecordTimestamp(remoteItem) ? localItem : remoteItem,
      );
      return;
    }

    const localTimestamp = getRecordTimestamp(localItem);
    const isNewerOfflineRecord = lastSyncedAt > 0
      ? localTimestamp > lastSyncedAt
      : remoteItems.length === 0 || localTimestamp > latestRemoteTimestamp;
    if (isNewerOfflineRecord) merged.set(localItem.id, localItem);
  });

  const result = [...merged.values()];
  return sortItems ? result.sort(sortItems) : result;
}

function shouldPreserveLocalPlanOverrides() {
  const dirtyAt = localStorage.getItem(PLAN_DIRTY_STORAGE_KEY);
  if (!dirtyAt) return false;
  const lastSyncedAt = syncState.planOverrides ? new Date(syncState.planOverrides).getTime() : 0;
  return new Date(dirtyAt).getTime() > lastSyncedAt;
}

function loadPlanOverrides() {
  try {
    return normalizePlanOverrides(JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || "{}"));
  } catch {
    return {};
  }
}

function loadRecurringItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECURRING_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.map(normalizeRecurringItem) : [];
  } catch {
    return [];
  }
}

function loadRecurringOccurrenceStatuses() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECURRING_STATUS_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function loadNetWorthItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(NET_WORTH_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function loadEntries() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsedEntries = JSON.parse(stored);
      return Array.isArray(parsedEntries) ? parsedEntries.map(normalizeEntry) : [];
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
      return values.map((entry) => normalizeEntry({
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

function parseBankCsv(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error("CSV has no transaction rows.");

  const headers = rows[0].map(normalizeCsvHeader);
  const records = rows.slice(1).filter((row) => row.some((cell) => String(cell).trim()));
  const dateIndex = findCsvColumn(headers, ["date", "transaction date", "posted date", "effective date"]);
  const descriptionIndex = findCsvColumn(headers, ["description", "details", "transaction description", "merchant", "narrative", "payee"]);
  const amountIndex = findCsvColumn(headers, ["amount", "transaction amount", "value"]);
  const debitIndex = findCsvColumn(headers, ["debit", "withdrawal", "debits", "money out"]);
  const creditIndex = findCsvColumn(headers, ["credit", "deposit", "credits", "money in"]);

  if (dateIndex < 0 || descriptionIndex < 0 || (amountIndex < 0 && debitIndex < 0 && creditIndex < 0)) {
    throw new Error("Missing required columns.");
  }

  return records
    .map((row) => {
      const date = parseCsvDate(row[dateIndex]);
      const description = String(row[descriptionIndex] || "").trim();
      const signedAmount = getCsvSignedAmount(row, amountIndex, debitIndex, creditIndex);
      const amount = Math.abs(signedAmount);
      if (!date || !description || !Number.isFinite(amount) || amount <= 0) return null;
      const fingerprint = createImportFingerprint({ date, description, signedAmount });
      return { date, description, signedAmount, amount, fingerprint };
    })
    .filter(Boolean);
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === "\"") {
      if (quoted && next === "\"") {
        cell += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function normalizeCsvHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function findCsvColumn(headers, candidates) {
  const exactIndex = headers.findIndex((header) => candidates.includes(header));
  if (exactIndex >= 0) return exactIndex;
  return headers.findIndex((header) => candidates.some((candidate) => header.includes(candidate)));
}

function getCsvSignedAmount(row, amountIndex, debitIndex, creditIndex) {
  if (amountIndex >= 0) return parseCurrencyAmount(row[amountIndex]);
  const debit = debitIndex >= 0 ? parseCurrencyAmount(row[debitIndex]) : 0;
  const credit = creditIndex >= 0 ? parseCurrencyAmount(row[creditIndex]) : 0;
  if (credit) return Math.abs(credit);
  if (debit) return -Math.abs(debit);
  return 0;
}

function parseCurrencyAmount(value) {
  const cleaned = String(value || "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();
  if (!cleaned) return 0;
  const isWrappedNegative = cleaned.startsWith("(") && cleaned.endsWith(")");
  const number = Number(cleaned.replace(/[()]/g, ""));
  if (!Number.isFinite(number)) return 0;
  return isWrappedNegative ? -Math.abs(number) : number;
}

function parseCsvDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const slash = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : dateKey(parsed);
}

function createImportFingerprint({ date, description, signedAmount }) {
  return `${date}|${description.toLowerCase().replace(/\s+/g, " ").trim()}|${Number(signedAmount || 0).toFixed(2)}`;
}

function isImportedDuplicate(fingerprint) {
  return entries.some((entry) => entry.source === `${IMPORT_SOURCE_PREFIX}${fingerprint}`);
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
