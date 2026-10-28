function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatMoney(value) {
  return "₹" + value.toFixed(2);
}

function getMonthTotal(list) {
  const now = new Date();
  const currentMonth =
    now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

  return list
    .filter(function (e) {
      return e.date.slice(0, 7) === currentMonth;
    })
    .reduce(function (sum, e) {
      return sum + e.amount;
    }, 0);
}

function renderExpenses(list) {
  const tbody = document.getElementById("expense-list");
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No expenses found</td></tr>';
    return;
  }

  list.forEach(function (expense) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + escapeHTML(expense.title) + "</td>" +
      "<td>" + formatMoney(expense.amount) + "</td>" +
      '<td><span class="badge badge-' + expense.category + '">' + escapeHTML(expense.category) + "</span></td>" +
      "<td>" + expense.date + "</td>" +
      '<td><button class="edit-btn" data-id="' + expense.id + '">Edit</button>' +
      '<button class="delete-btn" data-id="' + expense.id + '">Delete</button></td>';
    tbody.appendChild(row);
  });
}

function renderSummary(list) {
  const total = list.reduce(function (sum, e) {
    return sum + e.amount;
  }, 0);

  const categoryTotals = {};
  list.forEach(function (e) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  let topCategory = "-";
  let highest = 0;
  for (const cat in categoryTotals) {
    if (categoryTotals[cat] > highest) {
      highest = categoryTotals[cat];
      topCategory = cat;
    }
  }

  document.getElementById("total-amount").textContent = formatMoney(total);
  document.getElementById("month-amount").textContent = formatMoney(getMonthTotal(list));
  document.getElementById("top-category").textContent = topCategory;
}

function renderBudget(list) {
  const budget = getBudget();
  const spent = getMonthTotal(list);
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("budget-text");

  bar.classList.remove("warn", "over");

  if (budget <= 0) {
    bar.style.width = "0%";
    text.textContent = "No budget set";
    return;
  }

  const percent = (spent / budget) * 100;
  bar.style.width = Math.min(percent, 100) + "%";

  if (percent > 100) {
    bar.classList.add("over");
    text.textContent =
      formatMoney(spent) + " of " + formatMoney(budget) +
      " used. Over budget by " + formatMoney(spent - budget);
  } else {
    if (percent >= 80) {
      bar.classList.add("warn");
    }
    text.textContent =
      formatMoney(spent) + " of " + formatMoney(budget) +
      " used (" + percent.toFixed(0) + "%)";
  }
}