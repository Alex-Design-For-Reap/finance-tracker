import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const EXPENSE_SECTIONS = ["Daily Expenses", "Financial Obligations", "Splurge", "Smile"];
const INCOME_SECTION = "Income";
const INVESTMENT_SECTION = "Investments / Savings";
const ANNUAL_RETURN_RATE = 0.1;
const SUPABASE_URL = "https://cqbtorlmiqdpcoxqnrjy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYnRvcmxtaXFkcGNveHFucmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjM4NTIsImV4cCI6MjA5NDI5OTg1Mn0.2zZTXBFND6bXTksO6M8KmM0SlKBl8N9cD_mtKaajW6c";
const ENTRIES_TABLE = "finance_entries";
const PLAN_OVERRIDES_TABLE = "finance_plan_overrides";
const PLAN_DATA_TABLE = "finance_plan_data";
const STORAGE_KEY = "finance-tracker-dated-entries:v2";
const LEGACY_STORAGE_KEY = "weekly-finance-tracker:v1";
const PLAN_STORAGE_KEY = "finance-tracker-plan-overrides:v2";
const HISTORICAL_SEED_KEY = "finance-tracker-historical-actuals:v2";
const HISTORICAL_ACTUAL_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"];
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
  dashboardSummary: document.querySelector("#dashboardSummary"),
  dashboardWorkbench: document.querySelector("#dashboardWorkbench"),
  periodModeSelect: document.querySelector("#periodModeSelect"),
  periodSelect: document.querySelector("#periodSelect"),
  entryDateInput: document.querySelector("#entryDateInput"),
  actualInput: document.querySelector("#actualInput"),
  categorySelect: document.querySelector("#categorySelect"),
  subcategorySelect: document.querySelector("#subcategorySelect"),
  saveButton: document.querySelector("#saveButton"),
  viewEntriesButton: document.querySelector("#viewEntriesButton"),
  editPlanButton: document.querySelector("#editPlanButton"),
  closeEntriesButton: document.querySelector("#closeEntriesButton"),
  entryModal: document.querySelector("#entryModal"),
  entryModalSummary: document.querySelector("#entryModalSummary"),
  planModal: document.querySelector("#planModal"),
  closePlanButton: document.querySelector("#closePlanButton"),
  planMonthSelect: document.querySelector("#planMonthSelect"),
  planSectionSelect: document.querySelector("#planSectionSelect"),
  planEditorList: document.querySelector("#planEditorList"),
  savePlanButton: document.querySelector("#savePlanButton"),
  resetPlanButton: document.querySelector("#resetPlanButton"),
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
let planOverrides = loadPlanOverrides();
let currentUser = null;
let dashboardReady = false;

init();

async function init() {
  setupAuthListeners();
  setupTrackerListeners();
  await hydrateAuthState();
  await initializeDashboard();
}

function setupTrackerListeners() {
  els.periodModeSelect.addEventListener("change", () => {
    els.entryDateInput.value = getDefaultEntryDateKey();
    populatePeriodOptions(els.entryDateInput.value);
  });
  els.periodSelect.addEventListener("change", syncDateToPeriod);
  els.entryDateInput.addEventListener("change", syncPeriodToDate);
  els.categorySelect.addEventListener("change", populateSubcategoryOptions);
  els.actualInput.addEventListener("input", updateLiveVariance);
  els.saveButton.addEventListener("click", saveEntry);
  els.viewEntriesButton.addEventListener("click", openEntryModal);
  els.editPlanButton.addEventListener("click", openPlanModal);
  els.closeEntriesButton.addEventListener("click", closeEntryModal);
  els.closePlanButton.addEventListener("click", closePlanModal);
  els.planMonthSelect.addEventListener("change", renderPlanEditor);
  els.planSectionSelect.addEventListener("change", renderPlanEditor);
  els.savePlanButton.addEventListener("click", savePlanEditor);
  els.resetPlanButton.addEventListener("click", resetPlanSection);
  els.entryModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) closeEntryModal();
  });
  els.planModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-plan-modal]")) closePlanModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEntryModal();
      closePlanModal();
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
      closePlanModal();
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
  els.entryDateInput.value = getDefaultEntryDateKey();
  populatePeriodOptions(els.entryDateInput.value);
  dashboardReady = true;
  updateDashboardVisibility();
  render();
}

function updateDashboardVisibility() {
  const canShowDashboard = Boolean(currentUser && dashboardReady && financeData);
  els.trackerControls.hidden = !canShowDashboard;
  els.dashboardSummary.hidden = !canShowDashboard;
  els.dashboardWorkbench.hidden = !canShowDashboard;
}

function render() {
  if (!currentUser || !financeData || !periods.length) return;

  const period = getSelectedPeriod();
  const periodEntries = getEntriesForPeriod(period);
  const expenseEntries = periodEntries.filter((entry) => isExpenseCategory(entry.category));
  const incomeEntries = periodEntries.filter((entry) => entry.category === INCOME_SECTION);
  const actualTotal = sumEntries(expenseEntries);
  const target = getBudgetForRange(period.start, period.end, getExpenseSections());
  const incomeTarget = getBudgetForRange(period.start, period.end, [getSection(INCOME_SECTION)]);
  const actualIncome = sumEntries(incomeEntries);
  const displayedIncome = incomeEntries.length ? actualIncome : incomeTarget;

  els.actualInput.value = "";
  els.targetTitle.textContent = getTargetTitle(period.mode);
  els.monthBadge.textContent = period.label;
  els.weeklyTarget.textContent = money(target);
  els.targetBasis.textContent = `${period.shortLabel} expense plan`;
  els.actualSaved.textContent = money(actualTotal);
  els.savedLabel.textContent = expenseEntries.length
    ? `${expenseEntries.length} ${expenseEntries.length === 1 ? "expense" : "expenses"} in this period`
    : "No expenses yet";
  els.viewEntriesButton.textContent = periodEntries.length
    ? `See list of entries (${periodEntries.length})`
    : "See list of entries";
  els.monthlyPlan.textContent = money(displayedIncome);
  els.incomeLabel.textContent = incomeEntries.length
    ? `${incomeEntries.length} ${incomeEntries.length === 1 ? "income entry" : "income entries"} in this period`
    : "Income planned for selected period";

  renderEntryList(periodEntries);
  renderCategories(period, target);
  renderTrend(period);
  renderMiniTable(period);
  renderInvestments(period, periodEntries);
  updateLiveVariance();
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
  const periodEntries = getEntriesForPeriod(period).filter((entry) => isExpenseCategory(entry.category));
  const currentInput = isExpenseCategory(els.categorySelect.value) ? parseAmount(els.actualInput.value) : 0;
  const actual = sumEntries(periodEntries) + (Number.isFinite(currentInput) ? currentInput : 0);
  const target = getBudgetForRange(period.start, period.end, getExpenseSections());
  const variance = target - actual;
  const hasActual = actual > 0;

  els.varianceValue.textContent = hasActual ? money(Math.abs(variance)) : "$0";
  els.varianceCard.classList.toggle("is-good", hasActual && variance >= 0);
  els.varianceCard.classList.toggle("is-over", hasActual && variance < 0);
  els.varianceCopy.textContent = hasActual
    ? variance >= 0
      ? `${money(variance)} under target`
      : `${money(Math.abs(variance))} over target`
    : "Enter actual spend to compare";
}

function renderEntryList(periodEntries) {
  const period = getSelectedPeriod();
  els.entryList.replaceChildren();
  els.entryModalSummary.textContent = `${period.label} · ${money(sumEntries(periodEntries))} total entries`;

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
          <small>${entry.category || "Unclassified"} · ${entry.subcategory || "No subcategory"}</small>
        </span>
        <strong>${money(entry.amount)}</strong>
        <button type="button" aria-label="Edit entry ${index + 1}">Edit</button>
        <button type="button" aria-label="Remove entry ${index + 1}">Remove</button>
      `;
      row.querySelector(`[aria-label="Edit entry ${index + 1}"]`).addEventListener("click", () => renderEditEntry(entry));
      row.querySelector(`[aria-label="Remove entry ${index + 1}"]`).addEventListener("click", () => removeEntry(entry.id));
      els.entryList.append(row);
    });
}

function renderEditEntry(entry) {
  els.entryList.replaceChildren();
  els.entryModalSummary.textContent = "Edit entry";

  const form = document.createElement("form");
  form.className = "edit-entry-form";
  form.innerHTML = `
    <label>
      Date
      <input name="date" type="date" value="${entry.date}" required />
    </label>
    <label>
      Amount
      <input name="amount" type="text" inputmode="decimal" value="${entry.amount}" required />
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

  const categorySelect = form.elements.category;
  const subcategorySelect = form.elements.subcategory;
  populateCategorySelect(categorySelect, entry.category);
  populateSubcategorySelect(subcategorySelect, categorySelect.value, entry.subcategory);

  categorySelect.addEventListener("change", () => {
    populateSubcategorySelect(subcategorySelect, categorySelect.value);
  });
  form.querySelector("[data-cancel-edit]").addEventListener("click", () => {
    renderEntryList(getEntriesForPeriod(getSelectedPeriod()));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = parseAmount(form.elements.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) return;

    entries = entries.map((item) =>
      item.id === entry.id
        ? {
            ...item,
            date: form.elements.date.value,
            amount,
            category: categorySelect.value,
            subcategory: subcategorySelect.value,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
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

function openEntryModal() {
  renderEntryList(getEntriesForPeriod(getSelectedPeriod()));
  els.entryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.closeEntriesButton.focus();
}

function closeEntryModal() {
  els.entryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
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

function populateCategoryOptions() {
  els.categorySelect.replaceChildren();
  populateCategorySelect(els.categorySelect);
  populateSubcategoryOptions();
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
    const actual = sumEntries(
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
      const start = parseDate(`${month.key}-15`);
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

function isExpenseCategory(category) {
  return EXPENSE_SECTIONS.includes(category);
}

function getTargetTitle(mode) {
  if (mode === "month") return "Monthly target";
  if (mode === "week") return "Calendar week target";
  return "Pay cycle target";
}

function getPaceInfo({ actual, target, period, kind }) {
  const today = startOfDay(new Date());
  const periodDays = Math.max(getDaysBetween(period.start, period.end), 1);
  const elapsedDays = Math.min(Math.max(getDaysBetween(period.start, addDays(today, 1)), 0), periodDays);
  const expected = target * (elapsedDays / periodDays);
  const tolerance = Math.max(target * 0.05, 50);
  const delta = actual - expected;
  const isComplete = today >= period.end;
  const progress = expected > 0 ? Math.min((actual / expected) * 100, 100) : actual > 0 ? 100 : 0;

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
    date: row.entry_date,
    category: row.category,
    subcategory: row.subcategory || "",
    source: row.source || undefined,
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

function sumEntries(items) {
  return items.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
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
