const USERS_KEY = "expensetrail_users";
const SESSION_KEY = "expensetrail_session";
const LEGACY_KEY = "expensetrail_data";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return String(hash >>> 0);
}

function getCurrentUser() {
  return localStorage.getItem(SESSION_KEY);
}

function setCurrentUser(name) {
  localStorage.setItem(SESSION_KEY, name);
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

function dataKey() {
  return "expensetrail_data_" + getCurrentUser();
}

function budgetKey() {
  return "expensetrail_budget_" + getCurrentUser();
}

function migrateLegacyData(username) {
  const old = localStorage.getItem(LEGACY_KEY);
  if (old) {
    localStorage.setItem("expensetrail_data_" + username, old);
    localStorage.removeItem(LEGACY_KEY);
  }
  const oldBudget = localStorage.getItem("expensetrail_budget");
  if (oldBudget) {
    localStorage.setItem("expensetrail_budget_" + username, oldBudget);
    localStorage.removeItem("expensetrail_budget");
  }
}

function getExpenses() {
  return JSON.parse(localStorage.getItem(dataKey())) || [];
}

function saveExpenses(list) {
  localStorage.setItem(dataKey(), JSON.stringify(list));
}

function getBudget() {
  return parseFloat(localStorage.getItem(budgetKey())) || 0;
}

function saveBudget(value) {
  localStorage.setItem(budgetKey(), value);
}