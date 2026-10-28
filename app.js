const themeBtn = document.getElementById("theme-toggle");

if (localStorage.getItem("expensetrail_theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "Light mode";
}

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("expensetrail_theme", isDark ? "dark" : "light");
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
  if (getCurrentUser()) {
    refresh();
  }
});

let expenses = [];
let editingId = null;

function showApp() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("app-main").classList.remove("hidden");
  document.getElementById("user-info").classList.remove("hidden");
  document.getElementById("user-name").textContent = "👤 " + getCurrentUser();
}

function showAuth() {
  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("app-main").classList.add("hidden");
  document.getElementById("user-info").classList.add("hidden");
}

function startApp() {
  showApp();
  expenses = getExpenses();
  clearForm();
  document.getElementById("budget-input").value = getBudget() > 0 ? getBudget() : "";
  refresh();
}

function clearAuthInputs() {
  document.getElementById("auth-username").value = "";
  document.getElementById("auth-password").value = "";
}

document.getElementById("register-btn").addEventListener("click", function () {
  const name = document.getElementById("auth-username").value.trim().toLowerCase();
  const pass = document.getElementById("auth-password").value;

  if (name.length < 3 || pass.length < 4) {
    alert("Username needs at least 3 characters and password at least 4.");
    return;
  }

  const users = getUsers();
  if (Object.prototype.hasOwnProperty.call(users, name)) {
    alert("That username is already taken.");
    return;
  }

  const isFirstUser = Object.keys(users).length === 0;
  users[name] = hashPassword(pass);
  saveUsers(users);
  setCurrentUser(name);

  if (isFirstUser) {
    migrateLegacyData(name);
  }

  clearAuthInputs();
  startApp();
});

document.getElementById("login-btn").addEventListener("click", function () {
  const name = document.getElementById("auth-username").value.trim().toLowerCase();
  const pass = document.getElementById("auth-password").value;
  const users = getUsers();

  if (!Object.prototype.hasOwnProperty.call(users, name) || users[name] !== hashPassword(pass)) {
    alert("Wrong username or password.");
    return;
  }

  setCurrentUser(name);
  clearAuthInputs();
  startApp();
});

document.getElementById("auth-password").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.getElementById("login-btn").click();
  }
});

document.getElementById("logout-btn").addEventListener("click", function () {
  logoutUser();
  expenses = [];
  showAuth();
});

function getFilteredExpenses() {
  const category = document.getElementById("filter-category").value;
  const month = document.getElementById("filter-month").value;
  const search = document.getElementById("search").value.trim().toLowerCase();
  const sort = document.getElementById("sort").value;

  const result = expenses.filter(function (e) {
    const categoryMatch = category === "All" || e.category === category;
    const monthMatch = month === "" || e.date.slice(0, 7) === month;
    const searchMatch = e.title.toLowerCase().includes(search);
    return categoryMatch && monthMatch && searchMatch;
  });

  return result.slice().sort(function (a, b) {
    if (sort === "oldest") return a.date.localeCompare(b.date);
    if (sort === "high") return b.amount - a.amount;
    if (sort === "low") return a.amount - b.amount;
    return b.date.localeCompare(a.date);
  });
}

function refresh() {
  const filtered = getFilteredExpenses();
  renderExpenses(filtered);
  renderSummary(expenses);
  renderBudget(expenses);
  renderChart(filtered);
  renderTrendChart(expenses);
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
  document.getElementById("add-btn").textContent = "Add";
  editingId = null;
}

document.getElementById("add-btn").addEventListener("click", function () {
  const title = document.getElementById("title").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (title === "" || isNaN(amount) || amount <= 0 || date === "") {
    alert("Please enter a title, an amount greater than 0, and a date.");
    return;
  }

  if (editingId !== null) {
    expenses = expenses.map(function (e) {
      if (e.id === editingId) {
        return { id: e.id, title: title, amount: amount, category: category, date: date };
      }
      return e;
    });
  } else {
    expenses.push({
      id: Date.now(),
      title: title,
      amount: amount,
      category: category,
      date: date
    });
  }

  saveExpenses(expenses);
  clearForm();
  refresh();
});

document.getElementById("expense-list").addEventListener("click", function (event) {
  const id = Number(event.target.dataset.id);

  if (event.target.classList.contains("delete-btn")) {
    expenses = expenses.filter(function (e) {
      return e.id !== id;
    });
    saveExpenses(expenses);
    if (editingId === id) {
      clearForm();
    }
    refresh();
  }

  if (event.target.classList.contains("edit-btn")) {
    const expense = expenses.find(function (e) {
      return e.id === id;
    });
    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
    document.getElementById("add-btn").textContent = "Update";
    editingId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

document.getElementById("filter-category").addEventListener("change", refresh);
document.getElementById("filter-month").addEventListener("change", refresh);
document.getElementById("sort").addEventListener("change", refresh);
document.getElementById("search").addEventListener("input", refresh);

document.getElementById("budget-btn").addEventListener("click", function () {
  const value = parseFloat(document.getElementById("budget-input").value);

  if (isNaN(value) || value < 0) {
    alert("Please enter a valid budget amount.");
    return;
  }

  saveBudget(value);
  refresh();
});

document.getElementById("export-btn").addEventListener("click", function () {
  const list = getFilteredExpenses();

  if (list.length === 0) {
    alert("No expenses to export.");
    return;
  }

  let csv = "Title,Amount,Category,Date\n";
  list.forEach(function (e) {
    const safeTitle = '"' + e.title.replace(/"/g, '""') + '"';
    csv += safeTitle + "," + e.amount + "," + e.category + "," + e.date + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expensetrail.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

if (getCurrentUser()) {
  startApp();
} else {
  showAuth();
}