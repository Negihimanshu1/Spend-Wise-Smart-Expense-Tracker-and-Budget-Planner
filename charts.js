let expenseChart = null;
let trendChart = null;

function setChartTextColor() {
  Chart.defaults.color = document.body.classList.contains("dark") ? "#f1f5f9" : "#1f2937";
}

function renderChart(list) {
  const totals = {};
  list.forEach(function (e) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (expenseChart) {
    expenseChart.destroy();
    expenseChart = null;
  }

  if (labels.length === 0) {
    return;
  }

  setChartTextColor();

  expenseChart = new Chart(document.getElementById("expense-chart"), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "Spending by category" }
      }
    }
  });
}

function renderTrendChart(list) {
  const keys = [];
  const labels = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
    labels.push(d.toLocaleString("en-US", { month: "short", year: "2-digit" }));
  }

  const values = keys.map(function (key) {
    return list
      .filter(function (e) {
        return e.date.slice(0, 7) === key;
      })
      .reduce(function (sum, e) {
        return sum + e.amount;
      }, 0);
  });

  if (trendChart) {
    trendChart.destroy();
  }

  setChartTextColor();

  trendChart = new Chart(document.getElementById("trend-chart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Spent",
        data: values,
        backgroundColor: "#6366f1",
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "Monthly spending (last 6 months)" },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}